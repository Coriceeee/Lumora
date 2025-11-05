/// <reference types="@react-three/fiber" />

import { Object3DNode } from '@react-three/fiber';
import { AmbientLight, DirectionalLight, Mesh, Group, MeshStandardMaterial } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: Object3DNode<AmbientLight, typeof AmbientLight>;
      directionalLight: Object3DNode<DirectionalLight, typeof DirectionalLight>;
      mesh: Object3DNode<Mesh, typeof Mesh>;
      group: Object3DNode<Group, typeof Group>;
      meshStandardMaterial: Object3DNode<MeshStandardMaterial, typeof MeshStandardMaterial>;
    }
  }
}
