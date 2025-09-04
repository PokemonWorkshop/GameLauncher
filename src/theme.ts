import { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  button: {
    solid: {
      color: {
        border: '#4241A8',
        critical: {
          border: '#8C2B3B',
        },
      },
    },
  },
  color: {
    background: {
      accent: {
        emphasis: {
          active: '#6A6EEB',
          default: '#5660DC',
          hover: '#6567E7',
        },
        muted: {
          active: '#27295C',
          default: '#202245',
          hover: '#232650',
        },
        strong: {
          active: '#5750E3',
          default: '#645FFF',
        },
        subtle: {
          default: '#1C1E3B',
        },
      },
      critical: {
        emphasis: {
          active: 'rgba(194, 38, 49, 1)',
          default: 'rgba(221, 52, 56, 1)',
          hover: 'rgba(214, 43, 50, 1)',
        },
        subtle: {
          default: '#33181F',
        },
      },
      disabled: 'rgba(55, 88, 122, 0.03)',
      inverse: {
        selected: {
          default: '#292B30',
        },
      },
      static: {
        dark: {
          default: '#202225',
        },
      },
      subtle: {
        active: '#292B30',
        default: '#202225',
        hover: '#25262A',
        translucent: {
          hover: 'rgba(200, 168, 205, 0.03)',
        },
      },
    },
    border: {
      accent: {
        default: '#31327A',
        subtle: '#27295C',
      },
      subtle: '#2E3036',
    },
    icon: {
      accent: '#645FFF',
      critical: '#D43F56',
      default: {
        default: '#6C707B',
      },
      static: {
        white: '#FFF',
      },
    },
    static: {
      black: {
        '250': 'rgba(0, 0, 0, 0.25)',
      },
      transparent: 'rgba(255, 255, 255, 0.01)',
    },
    slider: {
      background: '#292B30',
    },
    surface: {
      default: '#17181A',
      overlay: 'rgba(32, 34, 37, 0.9)',
    },
    text: {
      accent: {
        muted: '#9FA9FC',
      },
      critical: {
        subtle: '#F55C71',
      },
      default: '#F0F2F5',
      disabled: '#4F525B',
      inverse: {
        default: '#FFF',
        subtle: '#8E929D',
      },
      link: {
        default: '#7E85F9',
      },
      muted: '#B4B7C1',
      static: {
        white: '#FFF',
      },
      subtle: '#8E929D',
    },
  },
  fonts: {
    body: {
      large: `font-family: Oak Sans;
              font-style: normal;
              font-weight: 475;
              font-size: 20px;`,
      medium: `font-family: Oak Sans;
               font-style: normal;
               font-weight: 400;
               font-size: 18px;`,
      small: `font-family: Oak Sans;
              font-style: normal;
              font-weight: 400;
              font-size: 14px;`,
    },
    label: {
      medium: `font-family: Oak Sans;
               font-style: normal;
               font-weight: 475;
               font-size: 18px;`,
      small: `font-family: Oak Sans;
              font-style: normal;
              font-weight: 475;
              font-size: 14px;`,
    },
  },
  titlebar: {
    height: window.launcherApi.platform() === 'win32' ? '26px' : '0',
  },
};
