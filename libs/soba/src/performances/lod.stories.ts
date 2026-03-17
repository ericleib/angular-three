import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { Meta } from '@storybook/angular';
import { NgtArgs } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { NgtsLODImpl, NgtsLODLevel } from 'angular-three-soba/performances';
import { storyDecorators, storyFunction } from '../setup-canvas';

@Component({
	template: `
		<ngt-group lod [maxDistance]="200">
			<ngt-mesh *lodLevel>
				<ngt-icosahedron-geometry *args="[10, 3]" />
				<ngt-mesh-basic-material color="hotpink" wireframe />
			</ngt-mesh>

			<ngt-mesh *lodLevel="{distance: 50}" (click)="toggleColor()">
				<ngt-icosahedron-geometry *args="[10, 2]" />
				<ngt-mesh-basic-material [color]="color()" wireframe />
			</ngt-mesh>

			<ngt-mesh *lodLevel="{distance: 150, hysteresis:0.1}">
				<ngt-icosahedron-geometry *args="[10, 1]" />
				<ngt-mesh-basic-material color="lightblue" wireframe />
			</ngt-mesh>
		</ngt-group>

		<ngts-orbit-controls [options]="{ enablePan: false, enableRotate: false, zoomSpeed: 0.5 }" />
	`,
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgtsLODImpl, NgtsLODLevel, NgtArgs, NgtsOrbitControls],
})
class DefaultLODStory {
	protected color = signal('#ff0000');
    
    toggleColor() {
        this.color.update(c => c === '#ff0000'? '#00ff00' : '#ff0000' );
    }
}

export default {
	title: 'Performances/LOD',
	decorators: storyDecorators(),
} as Meta;

export const Default = storyFunction(DefaultLODStory, {
	camera: { position: [0, 0, 100] },
	controls: false,
});
