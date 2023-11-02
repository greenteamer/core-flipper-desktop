import { Typography } from "antd";
import {
  DataInspector,
  DataTableColumn,
  DetailSidebar,
  Layout,
  PluginClient,
  createState,
  createTablePlugin,
  usePlugin,
  // create
} from "flipper-plugin";
import React from "react";

type Row = {
  id: number;
  action: string;
  step: string;
};

const columns: DataTableColumn<Row>[] = [
  {
    key: "action",
    width: 150,
    title: "Action",
  },
  {
    key: "step",
    title: "Step",
  },
];

const { plugin, Component } = createTablePlugin<Row>({
  columns,
  method: "newRow",
  key: "id",
  resetMethod: "reset",
  renderSidebar: (row) => (
    <div>
      <span>{row.action}</span> - <span>{row.step}</span>
      <DataInspector data={row} expandRoot={true} />
    </div>
  ),
});

export { plugin, Component };
