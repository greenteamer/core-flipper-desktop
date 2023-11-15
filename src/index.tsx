import { Button, Table, Typography } from "antd";
import {
  DataInspector,
  DetailSidebar,
  Layout,
  PluginClient,
  createState,
  usePlugin,
  useValue,
} from "flipper-plugin";
import React from "react";

type Row = {
  id: number;
  action: string;
  step: string;
};

type Events = {
  appState: any;
  newRow: Row;
  reset: any;
};

type Methods = {
  calloutStepError(): Promise<{ message: string }>;
};

export function plugin(client: PluginClient<Events, Methods>) {
  const appState = createState<Record<string, any>>(
    {},
    { persist: "appState" }
  );

  const appStateDisplayed = createState<boolean>(true, {
    persist: "appStateDisplayed",
  });

  const rows = createState<Record<string, Row>>({}, { persist: "rows" });
  const selectedID = createState<string | null>(null, { persist: "selection" });

  client.onMessage("appState", (state) => {
    appState.set(state);
  });

  client.onMessage("newRow", (row) => {
    rows.update((draft) => {
      draft[row.id] = row;
    });
  });

  client.onMessage("reset", () => {
    rows.set({});
  });

  client.addMenuEntry({
    label: "Reset Selection",
    accelerator: "CmdOrCtrl+R",
    handler: () => {
      rows.set({});
    },
  });

  function setSelection(id: number) {
    selectedID.set("" + id);
  }

  function showAppState() {
    appStateDisplayed.set(!appStateDisplayed.get());
  }

  function setError() {
    client.send("calloutStepError", undefined);
  }

  return {
    appState,
    appStateDisplayed,
    showAppState,
    rows,
    selectedID,
    setSelection,
    setError,
  };
}

export function Component() {
  const instance = usePlugin(plugin);
  const appState = useValue(instance.appState);
  const appStateDisplayed = useValue(instance.appStateDisplayed);
  const rows = useValue(instance.rows);
  const selectedID = useValue(instance.selectedID);

  const dataSource = Object.entries(rows).map((i) => i[1]);
  console.log(appStateDisplayed);

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Step",
      dataIndex: "step",
      key: "step",
    },
  ];

  // (4)
  return (
    <>
      <Button onClick={instance.setError}>Test Error</Button>
      <Button onClick={instance.showAppState}>
        {appStateDisplayed ? "Hide" : "Show"} App State
      </Button>
      <Layout.ScrollContainer vertical>
        <Layout.Horizontal gap pad style={{ flexWrap: "wrap" }}>
          <Table
            dataSource={dataSource}
            columns={columns}
            onRow={(record, rowIndex) => {
              return {
                onClick: () => {
                  instance.setSelection(record.id);
                },
              };
            }}
            rowSelection={{
              onSelect: (record) => instance.setSelection(record.id),
              selectedRowKeys: selectedID ? [selectedID] : [],
            }}
          />
        </Layout.Horizontal>
      </Layout.ScrollContainer>
      <DetailSidebar>
        {appStateDisplayed
          ? renderAppStateSidebar(appState)
          : selectedID
          ? renderSidebar(rows[selectedID])
          : null}
      </DetailSidebar>
    </>
  );
}

function renderAppStateSidebar(appState: any) {
  return (
    <Layout.Container gap pad>
      <Typography.Title level={4}>App State</Typography.Title>
      <DataInspector data={appState} expandRoot={true} />
    </Layout.Container>
  );
}

function renderSidebar(row: Row) {
  return (
    <Layout.Container gap pad>
      <Typography.Title
        level={4}
      >{`${row.id}: ${row.action} - ${row.step}`}</Typography.Title>
      <DataInspector data={row} expandRoot={true} />
    </Layout.Container>
  );
}
