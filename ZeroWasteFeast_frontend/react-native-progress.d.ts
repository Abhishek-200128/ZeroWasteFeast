declare module 'react-native-progress/Bar' {
    import { Component } from 'react';
    import { ViewProps } from 'react-native';
  
    interface ProgressBarProps extends ViewProps {
      progress?: number;
      indeterminate?: boolean;
      color?: string;
      unfilledColor?: string;
      borderWidth?: number;
      borderColor?: string;
      width?: number;
      height?: number;
      borderRadius?: number;
    }
  
    export default class ProgressBar extends Component<ProgressBarProps> {}
  }
  