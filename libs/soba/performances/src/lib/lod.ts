import { Component, contentChildren, Directive, ElementRef, inject, input, signal, TemplateRef } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { beforeRender, injectStore } from "angular-three";
import { mergeInputs } from 'ngxtension/inject-inputs';
import { Object3D, Vector3 } from "three";

export type NgtsLODLevelOptions = {
  distance: number;
  hysteresis: number;
}

const defaultLodLevelOptions: NgtsLODLevelOptions = {
  distance: 0,
  hysteresis: 0,
};

const _v1 = new Vector3();
const _v2 = new Vector3();

/**
 * Helper directive to capture a template to attach to
 * an NgtsLOD component.
 */
@Directive({
  selector: 'ng-template[lodLevel]'
})
export class NgtsLODLevel {
  lodLevel = input(defaultLodLevelOptions, { transform: mergeInputs(defaultLodLevelOptions) });
  template = inject(TemplateRef);
}

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
 * <ngt-group lod [maxDistance]="10000">
 *   <ngt-mesh *lodLevel />
 *   <ngt-mesh *lodLevel="{distance: 100, hysteresis: 0.1}" />
 *   <ngt-mesh *lodLevel="{distance: 1000}" />
 * </ngt-group>
 * ```
 */
@Component({
  selector: '[lod]',
  template: `
    <ng-container [ngTemplateOutlet]="level()?.template" />
  `,
  imports: [NgTemplateOutlet],
})
export class NgtsLODImpl {
  maxDistance = input<number>();

  private store = injectStore();
	private container = inject(ElementRef);

  readonly levels = contentChildren(NgtsLODLevel);
  readonly level = signal<NgtsLODLevel|undefined>(undefined);

  constructor() {
    beforeRender(() => {

      const levels = this.levels();
      const currentLevel = this.level();
      const maxDistance = this.maxDistance();

      let level: NgtsLODLevel|undefined = levels[0];

      if(level && (levels.length > 1 || maxDistance)) {

        const container = this.container.nativeElement as Object3D;
        const {matrixWorld, zoom} = this.store.snapshot.camera;

        _v1.setFromMatrixPosition( matrixWorld );
        _v2.setFromMatrixPosition( container.matrixWorld );

        const distance = _v1.distanceTo( _v2 ) / zoom;

        if(maxDistance && distance > maxDistance) {
          level = undefined;
        }
        else {
          for (let i = 1, l = levels.length; i < l; i ++ ) {
            const _level = levels[i];
            let {distance: levelDistance, hysteresis} = _level.lodLevel();

            if (hysteresis && currentLevel === _level) {
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
      }

      if(level !== currentLevel) {
        this.level.set(level);
      }
    });
  }
}

export const NgtsLOD = [NgtsLODImpl, NgtsLODLevel] as const;
