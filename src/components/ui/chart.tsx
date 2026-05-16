import * as React from "react";
import { useContext } from "react";
import { getNumberFormatter } from "@/shared/utils/formatters";
import { useTranslation } from "react-i18next";

import { cn } from "./utils";

// Theme constants for the chart.
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

import { ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from "recharts";

const ChartContainer = ({
  id,
  className,
  children,
  config,
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-grid-horizontal_line[stroke-opacity='0.5']]:stroke-zinc-200 dark:[&_.recharts-cartesian-grid-horizontal_line[stroke-opacity='0.5']]:stroke-zinc-800 [&_.recharts-cartesian-grid-vertical_line[stroke-opacity='0.5']]:stroke-zinc-200 dark:[&_.recharts-cartesian-grid-vertical_line[stroke-opacity='0.5']]:stroke-zinc-800 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-zinc-200 dark:[&_.recharts-curve.recharts-tooltip-cursor]:stroke-zinc-800 [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid-concentric-polygon]:stroke-zinc-200 dark:[&_.recharts-polar-grid-concentric-polygon]:stroke-zinc-800 [&_.recharts-polar-grid-concentric-circle]:stroke-zinc-200 dark:[&_.recharts-polar-grid-concentric-circle]:stroke-zinc-800 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-zinc-200 dark:[&_.recharts-cartesian-grid_line]:stroke-zinc-800 [&_.recharts-custom-symbol]:stroke-zinc-50 dark:[&_.recharts-custom-symbol]:stroke-zinc-900 [&_.recharts-dot]:stroke-zinc-50 dark:[&_.recharts-dot]:stroke-zinc-900 [&_.recharts-grid-background]:fill-transparent [&_.recharts-label]:fill-muted-foreground [&_.recharts-pie-label-line]:stroke-muted-foreground [&_.recharts-pie-sector]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-tooltip-cursor]:stroke-zinc-200 dark:[&_.recharts-tooltip-cursor]:stroke-zinc-800",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer>
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
};
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style>
      {Object.entries(THEMES)
        .map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .flatMap(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? [`  --color-${key}: ${color};`] : [];
  })
  .join("\n")}
}
`,
        )
        .join("\n")}
    </style>
  );
};

const ChartTooltip = RechartsTooltip;

const ChartTooltipLabel = ({
  config,
  payload,
  label,
  labelFormatter,
  labelClassName,
  hideLabel,
  labelKey,
}: {
  config: ChartConfig;
  payload: any[];
  label: any;
  labelFormatter?: (value: any, payload: any[]) => React.ReactNode;
  labelClassName?: string;
  hideLabel?: boolean;
  labelKey?: string;
}) => {
  if (hideLabel || !payload?.length) {
    return null;
  }

  const [item] = payload;
  const key = `${labelKey || item.dataKey || item.name || "value"}`;
  const itemConfig = getPayloadConfigFromPayload(config, item, key);
  const value =
    !labelKey && typeof label === "string"
      ? config[label as keyof typeof config]?.label || label
      : itemConfig?.label;

  if (labelFormatter) {
    return (
      <div className={cn("font-medium", labelClassName)}>
        {labelFormatter(value, payload)}
      </div>
    );
  }

  if (!value) {
    return null;
  }

  return <div className={cn("font-medium", labelClassName)}>{value}</div>;
};

const ChartTooltipContent = ({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  ref,
}: React.ComponentProps<any> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    ref?: React.Ref<HTMLDivElement>;
  }) => {
  const { config } = useChart();
  const { i18n } = useTranslation();

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length <= 1 && indicator !== "dashed";

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-xl dark:border-zinc-800 dark:bg-zinc-950",
        className,
      )}
    >
      {!nestLabel ? (
        <ChartTooltipLabel
          config={config}
          payload={payload}
          label={label}
          labelFormatter={labelFormatter}
          labelClassName={labelClassName}
          hideLabel={hideLabel}
          labelKey={labelKey}
        />
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item: any, index: number) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload.fill || item.color;

          return (
            <div
              key={item.dataKey || item.name || index}
              className={cn(
                "flex w-full items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground",
                indicator === "dashed" && "items-center",
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          },
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? (
                        <ChartTooltipLabel
                          config={config}
                          payload={payload}
                          label={label}
                          labelFormatter={labelFormatter}
                          labelClassName={labelClassName}
                          hideLabel={hideLabel}
                          labelKey={labelKey}
                        />
                      ) : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {getNumberFormatter(i18n.language).format(item.value as number)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsLegend;

const ChartLegendContent = ({
  className,
  hideIcon = false,
  payload,
  verticalAlign,
  nameKey,
  ref,
}: React.ComponentProps<"div"> &
  React.ComponentProps<any> & {
    hideIcon?: boolean;
    nameKey?: string;
    ref?: React.Ref<HTMLDivElement>;
  }) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload.map((item: any, index: number) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.dataKey || item.value || index}
            className={cn(
              "flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground",
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="size-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
};
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadConfig =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null &&
    key in payload.payload
      ? (payload.payload as any)[key]
      : undefined;

  let configLabelKey: string = key;

  if (
    key in config &&
    typeof payload === "object" &&
    payload !== null &&
    "dataKey" in payload &&
    payload.dataKey === key
  ) {
    configLabelKey = key;
  } else if (
    payloadConfig &&
    typeof payloadConfig === "string" &&
    payloadConfig in config
  ) {
    configLabelKey = payloadConfig;
  }

  return config[configLabelKey as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
