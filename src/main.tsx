import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App, CheckboxTreeDemo, DataGridDemo } from "./App.tsx";
import { ThreeColumnLayout } from "./ThreeColumnLayout.tsx";
import { Container, Typography, Tabs, Tab, Box } from "@mui/material";
import { useState } from "react";

function AllDemos() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
        コンポーネントデモ
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        sx={{ mb: 4 }}
      >
        <Tab label="ドラッグ可能ツリー" />
        <Tab label="チェックボックスツリー" />
        <Tab label="データグリッド" />
        <Tab label="3カラムレイアウト" />
      </Tabs>

      {activeTab === 0 && <App />}
      {activeTab === 1 && <CheckboxTreeDemo />}
      {activeTab === 2 && <DataGridDemo />}
      {activeTab === 3 && <ThreeColumnLayout />}
    </Box>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AllDemos />
  </StrictMode>,
);
