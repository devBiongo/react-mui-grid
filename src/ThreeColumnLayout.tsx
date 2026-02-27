import { useState } from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import {
  DraggableTree,
  type TreeNode,
  type DraggableTreeRef,
} from "./DraggableTree";
import { DataGrid } from "./DataGrid";
import { useRef } from "react";

const treeData: TreeNode[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    children: [
      {
        id: "1-1",
        name: "Work",
        type: "folder",
        children: [
          { id: "1-1-1", name: "Reports", type: "folder", children: [] },
          { id: "1-1-2", name: "Presentations", type: "folder", children: [] },
        ],
      },
      {
        id: "1-2",
        name: "Personal",
        type: "folder",
        children: [
          { id: "1-2-1", name: "Photos", type: "folder", children: [] },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Projects",
    type: "folder",
    children: [
      {
        id: "2-1",
        name: "Project A",
        type: "folder",
        children: [
          { id: "2-1-1", name: "Source", type: "folder", children: [] },
          { id: "2-1-2", name: "Assets", type: "folder", children: [] },
        ],
      },
    ],
  },
];

export function ThreeColumnLayout() {
  const treeRef = useRef<DraggableTreeRef>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedTreeNode, setSelectedTreeNode] = useState<TreeNode | null>(
    null,
  );

  // PDF示例URL（可以替换为实际的PDF文件）
  const pdfUrl = selectedRow
    ? `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#page=1`
    : null;

  const handleTreeItemClick = (node: TreeNode) => {
    setSelectedTreeNode(node);
    console.log("Tree node selected:", node);
  };

  const handleRowSelection = (row: any) => {
    setSelectedRow(row);
    console.log("Row selected:", row);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        gap: 2,
        p: 2,
        bgcolor: "#f5f5f5",
      }}
    >
      {/* 左侧：树形组件 */}
      <Paper
        elevation={3}
        sx={{
          width: "20%",
          minWidth: "250px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, bgcolor: "#1976d2", color: "white" }}>
          <Typography variant="h6">フォルダツリー</Typography>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          <DraggableTree
            ref={treeRef}
            data={treeData}
            onItemClick={handleTreeItemClick}
          />
        </Box>
      </Paper>

      {/* 中间：数据表格 */}
      <Paper
        elevation={3}
        sx={{
          width: "45%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, bgcolor: "#1976d2", color: "white" }}>
          <Typography variant="h6">データ一覧</Typography>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflow: "hidden", p: 2 }}>
          <DataGrid onRowSelected={handleRowSelection} />
        </Box>
      </Paper>

      {/* 右侧：PDF预览 */}
      <Paper
        elevation={3}
        sx={{
          width: "35%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, bgcolor: "#1976d2", color: "white" }}>
          <Typography variant="h6">プレビュー</Typography>
        </Box>
        <Divider />
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selectedRow ? (
            <iframe
              src={pdfUrl || ""}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title="PDF Preview"
            />
          ) : (
            <Box sx={{ textAlign: "center", color: "text.secondary", p: 4 }}>
              <Typography variant="h6" gutterBottom>
                プレビューなし
              </Typography>
              <Typography variant="body2">
                左の一覧から項目を選択してください
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
