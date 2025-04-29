import {
  Application,
  Assets,
  Sprite,
  // Container,
  Ticker,
  Filter,
  Container,
  TilingSprite,
  Texture,
  // Texture,
} from 'pixi.js'; // Version: ^8.6.6
import { Spine } from '@esotericsoftware/spine-pixi-v8';

import { BoundsIndicator } from '@/anim/bounds-indicator';
import { debounce } from '@/anim/utils/debounce';

import { purgeDispo } from '@/anim/utils/pixi';
// import { containScale, coverScale } from '@/anim/utils/scale-fit';

type AnimModesMap = {
  default: { foo: number };
  walk: { bar: string };
  pause: undefined;
};

export type AnimMode = keyof AnimModesMap;

type AnimModeWithParams = {
  [M in AnimMode]: {
    key: M;
    params: AnimModesMap[M];
  };
}[AnimMode];

const devMode: AnimModeWithParams | undefined = {
  key: 'default',
  params: { foo: 5 },
};

let isAssetsInitialized = false;
// import { delay } from '@/anim/utils/async';

const fixedConfig = {
  maxPixelRatio: 2.0,
  // maxFrameDelta: 10.0 / 60.0,
  defaultMode: {
    key: 'default',
    params: { foo: 66 },
  } satisfies AnimModeWithParams, // 'reset',
  debounceResize: false,
};

// Can be changed at runtime using updateConfig()
export const defaultConfig = {
  ...{
    debugCanvasBounds: false,
    debugStageBounds: false,
    backgroundColor: '#003030',
  },
  ...fixedConfig,
};

export type AnimConfig = typeof defaultConfig;

// import { KawaseBlurFilter } from 'pixi-filters';

type InitProps = {
  parent: HTMLElement;
  /** Used for hiding the loader */
  onLoaded?: () => void;
};

export type Anim = {
  init: (initProps: InitProps) => void;
  setMode(_mode: AnimModeWithParams): boolean;
  updateConfig: (configFragment: Partial<AnimConfig>) => void;
  destroy: () => Promise<void>;
  /** Show config values */
  outputConfig: () => void;
  /** Used for debugging */
  outputRenderInfo: () => void;
} | null;

export type AnimProps = {
  isDev: boolean;
  /** Base path used to load assets  */
  basePath?: string;
  defaultDims?: { width: number; height: number };
};

export function createAnim({ isDev, basePath = '/' }: AnimProps): Anim {
  let config: AnimConfig = { ...defaultConfig };

  let pxRatio: number | undefined;

  const dims = {
    width: 0,
    height: 0,
  };

  let app: Application | undefined = new Application();
  let resizeObserver: ResizeObserver | undefined;

  let mode: AnimModeWithParams;

  // Each container and sprite added by this class is
  // retained in this list an manually cleaned up
  const containers: Record<string, Container> = {};
  const sprites: Record<string, Sprite> = {};
  const filters: Record<string, Filter> = {};
  const spines: Record<string, Spine> = {};
  const tiles: Record<string, TilingSprite> = {};
  // let emitter: Emitter | null = null;

  // Create reference to shared
  const ticker = Ticker.shared;

  async function init({ parent, onLoaded }: InitProps) {
    if (!app) {
      return;
    }

    if (!window) {
      if (isDev) {
        console.warn("[anim] Cannot init as global 'window' not found");
      }
      return null;
    }

    pxRatio = window
      ? Math.min(window.devicePixelRatio, config.maxPixelRatio)
      : 1.0; // Pixel ratio is locked for duration

    // 1) Create app (renderer)

    await app.init({
      backgroundColor: config.backgroundColor,
      // resizeTo: window,
      autoDensity: true, // Adjusts the canvas using css pixels so it will scale properly
      backgroundAlpha: 1.0,
      //  width: 100, // Number of pixels being drawn
      //  height: 100, // Number of pixels being drawn
      resolution: pxRatio, //  The resolution / device pixel ratio of the renderer. Resolution controls scaling of content (sprites, etc.)
      hello: false,
      antialias: pxRatio === 1.0, //  Only anti alias from non-retina displays
      resizeTo: parent, // document.getElementById('sizer'), // parent, //parent.parentNode,
      // preference: 'webgl', //  'webgl' | 'webgpu'
    });

    // 2) Load all required assets

    if (isAssetsInitialized) {
      isAssetsInitialized = true;
      await Assets.init({
        basePath: basePath,
      });
    }

    await Assets.load('anim/img/sample-map.png');

    // Pre-load the skeleton data and atlas. You can also load .json skeleton data.
    Assets.add({ alias: 'spineboyData', src: 'anim/spine/spineboy-pro.skel' });
    Assets.add({
      alias: 'spineboyAtlas',
      src: 'anim/spine/spineboy-pma.atlas',
    });
    await Assets.load(['spineboyData', 'spineboyAtlas']);

    // 3) Attach (after loading)

    parent.appendChild(app.canvas);

    // 4) Observe stage dims

    resizeObserver = new ResizeObserver(
      debounce(
        (entries: ResizeObserverEntry[]) => {
          if (entries.length >= 1) {
            onResize(
              Math.round(entries[0].contentRect.width),
              Math.round(entries[0].contentRect.height),
            );
          }
        },
        config.debounceResize ? 100 : -1,
      ),
    );
    resizeObserver.observe(parent);

    if (onLoaded) {
      onLoaded();
    }
  }

  // - |dims| will be set before this is called
  // - |onResize| will be called immediately after
  function start() {
    if (!app) {
      return;
    }

    // 1) Set up scene (with loaded assets)

    /*
    sprites.bg = Sprite.from('anim/img/sample-map.png');
    //sprites.bg.alpha = 0.0;
    sprites.bg.anchor.set(0.5, 0.5);
    containers.artboard.addChild(sprites.bg);
    */

    tiles.bg = new TilingSprite({
      texture: Texture.from('anim/img/sample-map.png'),
    });

    app.stage.addChild(tiles.bg);

    /*
    sprites.box = Sprite.from(Texture.WHITE);
    sprites.box.width = 100.0;
    sprites.box.height = 100.0;
    sprites.box.tint = 0x1c81ff;
    sprites.box.anchor.set(0.5);
    sprites.box.alpha = 0.5;
    containers.artboard.addChild(sprites.box);
    */

    // Create the spine display object
    const spineboy = Spine.from({
      skeleton: 'spineboyData',
      atlas: 'spineboyAtlas',
      scale: 0.5,
    });

    // Set the default mix time to use when transitioning
    // from one animation to the next.
    spineboy.state.data.defaultMix = 0.2;
    // Set animation "run" on track 0, looped.
    spineboy.state.setAnimation(0, 'run', true);
    // Add the display object to the stage.
    console.log('spineboy', spineboy);
    // spineboy.scale.x *= -1.0;
    app.stage.addChild(spineboy);

    spines.spineboy = spineboy;

    containers.artboard = new Container();
    app.stage.addChild(containers.artboard);

    // 2) Apply all config keys for initial update

    updateConfig({ ...config }, true);

    // 3) Apply initial mode
    setMode(
      isDev && devMode ? devMode : (config.defaultMode as AnimModeWithParams),
    );

    // 3) Attach frame loop
    ticker.add(onTick);
    onTick();
  }

  let isStarted = false;
  // Shouldn't have to check if items exist
  function onResize(width: number, height: number) {
    dims.width = width;
    dims.height = height;

    if (!isStarted) {
      isStarted = true;
      start();
    }

    if (isDev) {
      console.log('[stage dims]', dims.width, 'x', dims.height);
    }

    containers.artboard.x = dims.width * 0.5;
    containers.artboard.y = dims.height * 0.5;

    if (containers.canvasBoundsIndicator) {
      (containers.canvasBoundsIndicator as BoundsIndicator).onResize(dims);
    }

    if (containers.stageBoundsIndicator) {
      (containers.stageBoundsIndicator as BoundsIndicator).onResize(dims);
    }

    if (spines.spineboy) {
      spines.spineboy.x = dims.width * 0.5;
      spines.spineboy.y = dims.height * 0.66;
    }

    if (tiles.bg) {
      tiles.bg.width = dims.width;
      tiles.bg.height = dims.height;
    }
  }

  let elapsedTime = 0.0;
  function onTick() {
    elapsedTime += ticker.elapsedMS * 0.001;

    /*
    ticker.deltaTime // Scalar value
    ticker.FPS
    */

    if (tiles.bg) {
      tiles.bg.tilePosition.x -= 10.5 * ticker.deltaTime;
    }

    if (elapsedTime === -1) {
      console.log('X');
    }
  }

  function setMode(_mode: AnimModeWithParams) {
    if (!isStarted) {
      if (isDev) {
        console.warn('Unable to set mode until started');
      }
      return false;
    }
    // Check new mode

    // Clean up old mode

    // Apply new mode
    mode = _mode;
    if (isDev) {
      console.log('[mode]', mode.key, 'params', mode.params);
    }

    return true;
  }

  function updateConfig(configFragment: Partial<AnimConfig>, isInit = false) {
    config = { ...config, ...configFragment };

    // 1) Updates at init and runtime

    if (configFragment.debugCanvasBounds !== undefined) {
      if (containers.canvasBoundsIndicator) {
        containers.canvasBoundsIndicator.visible =
          configFragment.debugCanvasBounds;
      } else if (configFragment.debugCanvasBounds) {
        const canvasBoundsIndicator = new BoundsIndicator();
        canvasBoundsIndicator.onResize(dims);
        app?.stage.addChild(canvasBoundsIndicator);
        containers.canvasBoundsIndicator = canvasBoundsIndicator;
      }
    }

    if (configFragment.debugStageBounds !== undefined) {
      if (containers.stageBoundsIndicator) {
        containers.stageBoundsIndicator.visible =
          configFragment.debugStageBounds;
      } else if (configFragment.debugStageBounds) {
        const stageBoundsIndicator = new BoundsIndicator({
          boundsWidth: 375.0,
          boundsHeight: 667.0,
          alignX: 0,
          alignY: -1,
        });
        stageBoundsIndicator.onResize(dims);
        app?.stage.addChild(stageBoundsIndicator);
        containers.stageBoundsIndicator = stageBoundsIndicator;
      }
    }

    if (isInit) {
      return;
    }

    // 2) Updates at runtime only

    // Warn if editing a fixed config at runtime
    if (isDev) {
      for (const key of Object.keys(fixedConfig)) {
        if (configFragment[key as keyof AnimConfig] !== undefined) {
          console.warn(`[config] Key '${key}' cannot be updated at runtime`);
        }
      }
    }

    if (configFragment.backgroundColor !== undefined && app) {
      app.renderer.background.color = config.backgroundColor;
    }
  }

  // Debug stage bounds

  function purgeAll() {
    for (const spineName in spines) {
      purgeDispo(spines[spineName]);
      delete spines[spineName];
    }

    for (const spriteName in sprites) {
      purgeDispo(sprites[spriteName]);
      delete sprites[spriteName];
    }

    for (const tileName in tiles) {
      purgeDispo(tiles[tileName]);
      delete tiles[tileName];
    }

    for (const containerName in containers) {
      purgeDispo(containers[containerName]);
      delete containers[containerName];
    }

    for (const filterName in filters) {
      const destroyPrograms = false;
      filters[filterName].destroy(destroyPrograms);
      delete filters[filterName];
    }
  }

  async function destroy() {
    ticker.remove(onTick);
    resizeObserver?.disconnect(); // Unobserves all observed Element or SVGElement targets.

    purgeAll();

    app?.destroy(
      { removeView: true },
      {
        children: true, // If set to true, all the children will have their destroy method called as well. 'options' will be passed on to those calls.
        texture: false, // Only used for child Sprites if options.children is set to true Should it destroy the texture of the child sprite
        // Leave source textures in assets
        textureSource: false, // Only used for children with textures e.g. Sprites. If options.children is set to true, it should destroy the texture source of the child sprite.
        context: false, // Only used for children with graphicsContexts e.g. Graphics. If options.children is set to true, it should destroy the context of the child graphics.
      },
    ); // https://pixijs.download/dev/docs/PIXI.PIXI.Application.html#destroy
    app = undefined;

    // await Assets.unload('http://some.url.com/image.png')
  }

  function outputRenderInfo() {
    console.log('[dims]', dims);
    console.log('[px.ratio]', app?.renderer.resolution);
    console.log('[renderer.name]', app?.renderer.name);
  }

  function outputConfig() {
    console.log(config);
  }

  return {
    init,
    setMode,
    updateConfig,
    outputConfig,
    outputRenderInfo,
    destroy,
  };
}
