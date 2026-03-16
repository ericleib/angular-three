import { Component, contentChildren, CUSTOM_ELEMENTS_SCHEMA, Directive, ElementRef, inject, input, linkedSignal, signal, TemplateRef, viewChild } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { beforeRender, injectStore } from "angular-three";
import { Object3D, Vector3 } from "three";

const _v1 = new Vector3();
const _v2 = new Vector3();

/**
 * Angular-native port of THREE.LOD
 *
 * Allows to display an object with several levels of details.
 *
 * The main difference with THREE.LOD is that we use angular-three
 * to add/remove the right object from the scene graph, rather than
 * setting the visible flag on one of the object, but keeping them
 * all in the graph.
 *
 * Usage:
 *
 * ```html
 * <ngt-group lod>
 *   <ngt-mesh *lodLevel="{distance: 0}" />
 *   <ngt-mesh *lodLevel="{distance: 100}" />
 *   <ngt-mesh *lodLevel="{distance: 1000}" />
 * </ngt-group>
 * ```
 */
@Component({
  selector: '[lod]',
  template: `
    <ng-container *ngTemplateOutlet="level()?.template" />
  `,
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
 imports: [NgTemplateOutlet],
})
export class NgtsLODImpl {
  private store = injectStore();
	private container = inject(ElementRef);

  readonly levels = contentChildren(NgtsLODLevel);
  readonly level = signal<NgtsLODLevel|undefined>(undefined);

  constructor() {
    beforeRender(() => {

      const levels = this.levels();
      const currentLevel = this.level();

      let level = levels[0];

      if(levels.length > 1) {

        const container = this.container.nativeElement as Object3D;
        const {matrixWorld, zoom} = this.store.snapshot.camera;

        _v1.setFromMatrixPosition( matrixWorld );
        _v2.setFromMatrixPosition( container.matrixWorld );

        const distance = _v1.distanceTo( _v2 ) / zoom;

        for (let i = 1, l = levels.length; i < l; i ++ ) {
          const _level = levels[i];
          let options = _level.lodLevel();
          let levelDistance = options?.distance || 0;
          let hysteresis = options?.hysteresis || 0;

          if (currentLevel === _level) {
            levelDistance -= levelDistance * hysteresis;
          }

          if (distance >= levelDistance) {
            level = _level;
          }
          else {
            break;
          }
        }
      }

      if(level !== currentLevel) {
        this.level.set(level);
      }
    });
  }
}


/**
 * Helper directive to capture a template to attach to
 * an NgtsLOD component.
 */
@Directive({
  selector: 'ng-template[lodLevel]'
})
export class NgtsLODLevel {
  lodLevel = input<{ distance?: number, hysteresis?: number }>();
  template = inject(TemplateRef);
}

export const NgtsLOD = [NgtsLODImpl, NgtsLODLevel] as const;
