// import original module declarations
import 'styled-components';

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    button: {
      solid: {
        color: {
          border: string;
          critical: {
            border: string;
          };
        };
      };
    };
    color: {
      background: {
        accent: {
          emphasis: {
            active: string;
            default: string;
            hover: string;
          };
          muted: {
            active: string;
            default: string;
            hover: string;
          };
          strong: {
            active: string;
            default: string;
          };
          subtle: {
            default: string;
          };
        };
        critical: {
          emphasis: {
            active: string;
            default: string;
            hover: string;
          };
          subtle: {
            default: string;
          };
        };
        disabled: string;
        inverse: {
          selected: {
            default: string;
          };
        };
        static: {
          dark: {
            default: string;
          };
        };
        subtle: {
          active: string;
          default: string;
          hover: string;
          translucent: {
            hover: string;
          };
        };
      };
      border: {
        accent: {
          default: string;
          subtle: string;
        };
        subtle: string;
      };
      icon: {
        accent: string;
        critical: string;
        default: {
          default: string;
        };
        static: {
          white: string;
        };
      };
      static: {
        black: {
          '250': string;
        };
        transparent: string;
      };
      slider: {
        background: string;
      };
      surface: {
        default: string;
        overlay: string;
      };
      text: {
        accent: {
          muted: string;
        };
        critical: {
          subtle: string;
        };
        default: string;
        disabled: string;
        inverse: {
          default: string;
          subtle: string;
        };
        link: {
          default: string;
        };
        muted: string;
        static: {
          white: string;
        };
        subtle: string;
      };
    };
    fonts: {
      body: {
        large: string;
        medium: string;
        small: string;
      };
      label: {
        medium: string;
        small: string;
      };
    };
    titlebar: {
      height: string;
    };
  }
}
