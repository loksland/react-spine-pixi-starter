import { bringToFront } from '@/anim/utils/pixi';
import {
  Container,
  ContainerChild,
  ContainerOptions,
  Sprite,
  Texture,
} from 'pixi.js';

/*
interface BoundsIndicatorType extends Container {
   onResize: (dims: { width: number; height: number }) => void;
}
export class BoundsIndicator extends Container implements BoundsIndicatorType ...
*/

type BoundsIndicatorProps = {
  boundsWidth: number;
  boundsHeight: number;
  alignX: -1 | 0 | 1;
  alignY: -1 | 0 | 1;
};

const borderSize = 3.0;

export class BoundsIndicator extends Container {
  fill: Sprite;
  mask: Sprite;

  boundsWidth: number;
  boundsHeight: number;
  alignX: number;
  alignY: number;

  constructor(
    {
      boundsWidth = -1,
      boundsHeight = -1,
      alignX = -1,
      alignY = -1,
    }: BoundsIndicatorProps = {
      boundsWidth: -1,
      boundsHeight: -1,
      alignX: -1,
      alignY: -1,
    },
    options?: ContainerOptions<ContainerChild>,
  ) {
    super(options);

    this.boundsWidth = boundsWidth;
    this.boundsHeight = boundsHeight;
    this.alignX = alignX;
    this.alignY = alignY;

    this.fill = Sprite.from(Texture.WHITE);
    this.fill.tint = 0x00ffc0; //0x1373e5;
    this.fill.alpha = 0.5;
    this.mask = Sprite.from(Texture.WHITE);

    this.fill.setMask({
      mask: this.mask,
      inverse: true,
    });

    this.addChild(this.fill);
    this.addChild(this.mask);
    this.interactive = false;
  }

  onResize({ width, height }: { width: number; height: number }) {
    const w = this.boundsWidth > 0.0 ? this.boundsWidth : width;
    const h = this.boundsHeight > 0.0 ? this.boundsHeight : height;

    this.fill.width = w;
    this.fill.height = h;

    if (this.alignX === 0) {
      this.fill.position.x = width * 0.5 - w * 0.5;
    } else if (this.alignX === 1) {
      this.fill.position.x = width - w;
    } else {
      this.fill.position.x = 0.0;
    }

    if (this.alignY === 0) {
      this.fill.position.y = height * 0.5 - h * 0.5;
    } else if (this.alignY === 1) {
      this.fill.position.y = height - h;
    } else {
      this.fill.position.y = 0.0;
    }

    this.mask.position.set(
      this.fill.position.x + borderSize,
      this.fill.position.y + borderSize,
    );
    this.mask.width = w - 2.0 * borderSize;
    this.mask.height = h - 2.0 * borderSize;

    bringToFront(this);
  }
  /*
  destroy(options?: DestroyOptions): void {
    // Destroy locally first
    super.destroy(options);
  }
  */
}
