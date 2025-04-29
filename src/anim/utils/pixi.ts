import { Container, ContainerChild, Sprite, TilingSprite } from 'pixi.js';
import gsap from 'gsap';

export function bringToFront(displayObject: ContainerChild) {
  if (!displayObject.parent) {
    return;
  }
  displayObject.parent.setChildIndex(
    displayObject,
    displayObject.parent.children.length - 1,
  );
}

export function purgeDispo(dispo: Container, destroy = false) {
  dispo.filters = [];
  gsap.killTweensOf(dispo);
  gsap.killTweensOf(dispo.position);
  gsap.killTweensOf(dispo.scale);
  gsap.killTweensOf(dispo.skew);

  if (destroy && !dispo.destroyed) {
    if (dispo instanceof Sprite) {
      const sprite = dispo as Sprite;
      sprite.destroy({
        texture: false, // Should it destroy the current texture of the renderable as well
        textureSource: false, // Should it destroy the textureSource of the renderable as well
      });
    } else if (dispo instanceof TilingSprite) {
      const tilingSprite = dispo as TilingSprite;
      tilingSprite.destroy({
        texture: false, // Should it destroy the current texture of the renderable as well
        textureSource: false, // Should it destroy the textureSource of the renderable as well
      });
    } else {
      dispo.destroy({
        children: false, // if set to true, all the children will have their destroy method called as well. 'options' will be passed on to those calls.
        texture: false, // Only used for children with textures e.g. Sprites. If options.children is set to true it should destroy the texture of the child sprite
        textureSource: false, // Only used for children with textures e.g. Sprites. If options.children is set to true it should destroy the texture source of the child sprite
        context: false, // Only used for children with graphicsContexts e.g. Graphics. If options.children is set to true it should destroy the context of the child graphics
      });
    }
  }
}
