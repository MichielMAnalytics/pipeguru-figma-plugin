import { useEffect, useState } from "react";
import { PluginUI, LoginScreen } from "plugin-ui";
import {
  Framework,
  PluginSettings,
  ConversionMessage,
  Message,
  HTMLPreview,
  LinearGradientConversion,
  SolidColorConversion,
  ErrorMessage,
  SettingsChangedMessage,
  Warning,
  ScreenData,
} from "types";
import { postUISettingsChangingMessage } from "./messaging";
import copy from "copy-to-clipboard";
import {
  loginToPipeGuru,
  storeAuthData,
  requestAuthState,
  clearAuthData,
  type AuthState,
} from "plugin-ui";

interface AppState {
  code: string;
  selectedFramework: Framework;
  isLoading: boolean;
  htmlPreview: HTMLPreview;
  settings: PluginSettings | null;
  colors: SolidColorConversion[];
  gradients: LinearGradientConversion[];
  warnings: Warning[];
  authState: AuthState;
  authChecked: boolean;
  screens: ScreenData[];
  currentScreenIndex: number;
}

const emptyPreview = { size: { width: 0, height: 0 }, content: "" };

export default function App() {
  const [state, setState] = useState<AppState>({
    code: "",
    selectedFramework: "HTML",
    isLoading: false,
    htmlPreview: emptyPreview,
    settings: null,
    colors: [],
    gradients: [],
    warnings: [],
    authState: {
      isAuthenticated: false,
      token: null,
      user: null,
    },
    authChecked: false,
    screens: [],
    currentScreenIndex: 0,
  });

  const rootStyles = getComputedStyle(document.documentElement);
  const figmaColorBgValue = rootStyles
    .getPropertyValue("--figma-color-bg")
    .trim();

  useEffect(() => {
    // Check authentication on mount
    requestAuthState();

    window.onmessage = (event: MessageEvent) => {
      const untypedMessage = event.data.pluginMessage as any;
      console.log("[ui] message received:", untypedMessage);

      switch (untypedMessage.type) {
        case "pipeguru-auth-state-response":
          setState((prevState) => ({
            ...prevState,
            authState: {
              isAuthenticated: untypedMessage.isAuthenticated,
              token: untypedMessage.token,
              user: untypedMessage.user,
            },
            authChecked: true,
          }));
          break;

        case "pipeguru-token-cleared":
          setState((prevState) => ({
            ...prevState,
            authState: {
              isAuthenticated: false,
              token: null,
              user: null,
            },
          }));
          break;

        case "conversionStart":
          setState((prevState) => ({
            ...prevState,
            code: "",
            isLoading: true,
          }));
          break;

        case "code":
          const conversionMessage = untypedMessage as ConversionMessage;

          // If screens array is present, use the first screen's data
          if (conversionMessage.screens && conversionMessage.screens.length > 0) {
            const firstScreen = conversionMessage.screens[0];
            setState((prevState) => ({
              ...prevState,
              code: firstScreen.code,
              htmlPreview: firstScreen.htmlPreview,
              warnings: firstScreen.warnings,
              colors: conversionMessage.colors,
              gradients: conversionMessage.gradients,
              settings: conversionMessage.settings,
              selectedFramework: conversionMessage.settings.framework,
              screens: conversionMessage.screens,
              currentScreenIndex: 0,
              isLoading: false,
            }));
          } else {
            // Backward compatibility: single screen
            setState((prevState) => ({
              ...prevState,
              ...conversionMessage,
              selectedFramework: conversionMessage.settings.framework,
              screens: [],
              currentScreenIndex: 0,
              isLoading: false,
            }));
          }
          break;

        case "pluginSettingChanged":
          const settingsMessage = untypedMessage as SettingsChangedMessage;
          setState((prevState) => ({
            ...prevState,
            settings: settingsMessage.settings,
            selectedFramework: settingsMessage.settings.framework,
          }));
          break;

        case "empty":
          // const emptyMessage = untypedMessage as EmptyMessage;
          setState((prevState) => ({
            ...prevState,
            code: "",
            htmlPreview: emptyPreview,
            warnings: [],
            colors: [],
            gradients: [],
            screens: [],
            currentScreenIndex: 0,
            isLoading: false,
          }));
          break;

        case "error":
          const errorMessage = untypedMessage as ErrorMessage;

          setState((prevState) => ({
            ...prevState,
            colors: [],
            gradients: [],
            code: `Error :(\n// ${errorMessage.error}`,
            isLoading: false,
          }));
          break;

        case "selection-json":
          const json = event.data.pluginMessage.data;
          copy(JSON.stringify(json, null, 2));

        default:
          break;
      }
    };

    return () => {
      window.onmessage = null;
    };
  }, []);

  const handleFrameworkChange = (updatedFramework: Framework) => {
    if (updatedFramework !== state.selectedFramework) {
      setState((prevState) => ({
        ...prevState,
        // code: "// Loading...",
        selectedFramework: updatedFramework,
      }));
      postUISettingsChangingMessage("framework", updatedFramework, {
        targetOrigin: "*",
      });
    }
  };
  const handlePreferencesChange = (
    key: keyof PluginSettings,
    value: boolean | string | number,
  ) => {
    if (state.settings && state.settings[key] === value) {
      // do nothing
    } else {
      postUISettingsChangingMessage(key, value, { targetOrigin: "*" });
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await loginToPipeGuru(email, password);
    storeAuthData(result.token, result.user);

    setState((prevState) => ({
      ...prevState,
      authState: {
        isAuthenticated: true,
        token: result.token,
        user: result.user,
      },
    }));
  };

  const handleLogout = () => {
    clearAuthData();
  };

  const handleScreenChange = (index: number) => {
    if (state.screens.length > 0 && index >= 0 && index < state.screens.length) {
      const screen = state.screens[index];
      setState((prevState) => ({
        ...prevState,
        currentScreenIndex: index,
        code: screen.code,
        htmlPreview: screen.htmlPreview,
        warnings: screen.warnings,
      }));
    }
  };

  const darkMode = figmaColorBgValue !== "#ffffff";

  // Show loading state while checking auth
  if (!state.authChecked) {
    return (
      <div className={`${darkMode ? "dark" : ""} h-full flex items-center justify-center`}>
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!state.authState.isAuthenticated) {
    return (
      <div className={`${darkMode ? "dark" : ""} h-full`}>
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <PluginUI
        isLoading={state.isLoading}
        code={state.code}
        warnings={state.warnings}
        selectedFramework={state.selectedFramework}
        setSelectedFramework={handleFrameworkChange}
        onPreferenceChanged={handlePreferencesChange}
        htmlPreview={state.htmlPreview}
        settings={state.settings}
        colors={state.colors}
        gradients={state.gradients}
        authState={state.authState}
        onLogout={handleLogout}
        screens={state.screens}
        currentScreenIndex={state.currentScreenIndex}
        onScreenChange={handleScreenChange}
      />
    </div>
  );
}
