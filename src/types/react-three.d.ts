import { Object3DNode } from "@react-three/fiber";
import * as THREE from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      float: any;
      orbitControls: any;
      instancedMesh: Object3DNode<THREE.InstancedMesh, typeof THREE.InstancedMesh>;
      circleGeometry: Object3DNode<THREE.CircleGeometry, typeof THREE.CircleGeometry>;
    }
  }
}
