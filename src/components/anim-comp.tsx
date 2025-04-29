import { createAnim, Anim, defaultConfig } from '@/anim';
import { cn } from '@/libs/cn';
import { ClassValue } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useControls, button, folder, Leva } from 'leva';
type AnimWrapperProps = { className?: ClassValue };

export function AnimComp({ className }: AnimWrapperProps) {
  const [showLeva, setShowLeva] = useState(false);
  const isMonitoringFPS = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window?.location?.search);
    const config = params.get('config');
    if (config !== null) {
      setShowLeva(true);
    }
  }, []);

  useControls({
    Scene: folder({
      debugStageBounds: {
        value: defaultConfig.debugStageBounds,
        onChange: (val) => {
          anim.current?.updateConfig({
            debugStageBounds: val,
          });
        },
      },
      debugCanvasBounds: {
        value: defaultConfig.debugCanvasBounds,
        onChange: (val) => {
          anim.current?.updateConfig({
            debugCanvasBounds: val,
          });
        },
      },

      outputRenderInfo: button(() => {
        anim.current?.outputRenderInfo();
      }),
    }),

    Utils: folder({
      'monitor fps': button(() => {
        if (isMonitoringFPS.current) {
          return;
        }
        isMonitoringFPS.current = true;
        (function () {
          const script = document.createElement('script');
          script.onload = function () {
            const stats = new Stats();
            document.body.appendChild(stats.dom);
            (stats.dom.children[1] as HTMLElement).style.display = 'block';
            if (stats.dom.children[2])
              (stats.dom.children[2] as HTMLElement).style.display = 'block';
            requestAnimationFrame(function loop() {
              stats.update();
              requestAnimationFrame(loop);
            });
          };
          script.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js';
          document.head.appendChild(script);
        })();
      }),

      'hide panel': button(() => {
        setShowLeva(false);
      }),
      outputConfig: button(() => {
        anim.current?.outputConfig();
      }),

      destroy: button(() => {
        anim.current?.destroy();
        anim.current = null;
      }),
    }),
  });

  const anim = useRef<Anim>(null);
  const containingDiv = useRef(null);

  // Create and destroy

  useEffect(() => {
    if (containingDiv.current) {
      const _anim = createAnim({
        isDev: import.meta.env.DEV,
        basePath: import.meta.env.BASE_URL,
      });
      if (_anim) {
        anim.current = _anim; // For this comp to communicate with
        const initResult = _anim.init({
          parent: containingDiv.current,
          onLoaded: () => {
            // Used to dismiss a loader
            //setIsLoading(false);
            if (import.meta.env.DEV) {
              console.log('Load complete');
            }
          },
        });
        return () => {
          async function delayedDestroy() {
            anim.current = null; // Prevent references
            await initResult; // Ensure the init is complete before destroying (this is required for safe mode compatibility)
            _anim?.destroy(); // This may be async
          }
          delayedDestroy();
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Needed to trigger HMR on anim (createAnim) change
  }, [createAnim]); // Triggers HMR when anim function changes

  // Notes:

  return (
    <div className={cn('absolute w-full h-full self-stretch', className)}>
      <Leva collapsed={true} hidden={!showLeva} />
      <div
        ref={containingDiv}
        className={cn(
          'overflow-hidden', // Prevent the canvas pushing out the size of its own container
          'w-full h-full',
        )}
      ></div>
    </div>
  );
}
