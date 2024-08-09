import type { EasingType } from '@visactor/vrender';

export interface IAction<T> {
  action: string;
  startTime?: number;
  payload: T;
}

export interface IAnimationParams {
  duration: number;
  easing?: EasingType;
  loop?: number | boolean;
}

export interface IActionPayload {
  animation?: IAnimationParams;
}