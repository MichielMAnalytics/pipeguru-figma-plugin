import copy from "copy-to-clipboard";
import Preview from "./components/Preview";
import GradientsPanel from "./components/GradientsPanel";
import ColorsPanel from "./components/ColorsPanel";
import CodePanel from "./components/CodePanel";
import About from "./components/About";
import WarningsPanel from "./components/WarningsPanel";
import {
  Framework,
  HTMLPreview,
  LinearGradientConversion,
  PluginSettings,
  SolidColorConversion,
  Warning,
} from "types";
import {
  preferenceOptions,
  selectPreferenceOptions,
} from "./codegenPreferenceOptions";
import Loading from "./components/Loading";
import { useState } from "react";
import { InfoIcon, LogOut } from "lucide-react";
import React from "react";
import { AuthState } from "./lib/auth-storage";

type PluginUIProps = {
  code: string;
  htmlPreview: HTMLPreview;
  warnings: Warning[];
  selectedFramework: Framework;
  setSelectedFramework: (framework: Framework) => void;
  settings: PluginSettings | null;
  onPreferenceChanged: (
    key: keyof PluginSettings,
    value: boolean | string | number,
  ) => void;
  colors: SolidColorConversion[];
  gradients: LinearGradientConversion[];
  isLoading: boolean;
  authState: AuthState;
  onLogout: () => void;
};

const frameworks: Framework[] = ["HTML", "Tailwind", "Flutter", "SwiftUI"];

type FrameworkTabsProps = {
  frameworks: Framework[];
  selectedFramework: Framework;
  setSelectedFramework: (framework: Framework) => void;
  showAbout: boolean;
  setShowAbout: (show: boolean) => void;
};

const FrameworkTabs = ({
  frameworks,
  selectedFramework,
  setSelectedFramework,
  showAbout,
  setShowAbout,
}: FrameworkTabsProps) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-1 grow">
      {frameworks.map((tab) => (
        <button
          key={`tab ${tab}`}
          className={`w-full text-sm rounded-md transition-colors font-medium ${
            selectedFramework === tab && !showAbout
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted hover:bg-primary/90 hover:text-primary-foreground"
          }`}
          onClick={() => {
            setSelectedFramework(tab as Framework);
            setShowAbout(false);
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export const PluginUI = (props: PluginUIProps) => {
  const [showAbout, setShowAbout] = useState(false);

  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewViewMode, setPreviewViewMode] = useState<
    "desktop" | "mobile" | "precision"
  >("precision");
  const [previewBgColor, setPreviewBgColor] = useState<"white" | "black">(
    "white",
  );

  if (props.isLoading) return <Loading />;

  const isEmpty = props.code === "";
  const warnings = props.warnings ?? [];

  return (
    <div className="flex flex-col h-full dark:text-white">
      {/* Header with user info and logout button */}
      <div className="p-2 dark:bg-card border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {props.authState.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium dark:text-white">
                {props.authState.user?.name || 'User'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {props.authState.user?.email || ''}
              </span>
            </div>
          </div>
          <button
            onClick={props.onLogout}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="Logout from PipeGuru"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col h-full overflow-y-auto">
        {showAbout ? (
          <About
            useOldPluginVersion={props.settings?.useOldPluginVersion2025}
            onPreferenceChanged={props.onPreferenceChanged}
          />
        ) : (
          <div className="flex flex-col items-center px-4 py-2 gap-2 dark:bg-transparent">
            {isEmpty === false && props.htmlPreview && (
              <Preview
                htmlPreview={props.htmlPreview}
                expanded={previewExpanded}
                setExpanded={setPreviewExpanded}
                viewMode={previewViewMode}
                setViewMode={setPreviewViewMode}
                bgColor={previewBgColor}
                setBgColor={setPreviewBgColor}
              />
            )}

            {warnings.length > 0 && <WarningsPanel warnings={warnings} />}

            <CodePanel
              code={props.code}
              selectedFramework={props.selectedFramework}
              preferenceOptions={preferenceOptions}
              selectPreferenceOptions={selectPreferenceOptions}
              settings={props.settings}
              onPreferenceChanged={props.onPreferenceChanged}
              authState={props.authState}
              warnings={warnings}
            />

            {props.colors.length > 0 && (
              <ColorsPanel
                colors={props.colors}
                onColorClick={(value) => {
                  copy(value);
                }}
              />
            )}

            {props.gradients.length > 0 && (
              <GradientsPanel
                gradients={props.gradients}
                onColorClick={(value) => {
                  copy(value);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
