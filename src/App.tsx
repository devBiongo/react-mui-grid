import { Container, Typography, Box, Button } from "@mui/material";
import {
  DraggableTree,
  type TreeNode,
  type DraggableTreeRef,
} from "./DraggableTree";
import {
  CheckboxTree,
  type CheckboxTreeNode,
  type CheckboxTreeRef,
} from "./CheckboxTree";
import { DataGrid } from "./DataGrid";
import { useRef, useState } from "react";

const initialData: TreeNode[] = [
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
      { id: "1-3", name: "Archive", type: "folder", children: [] },
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
      {
        id: "2-2",
        name: "Project B",
        type: "folder",
        children: [],
      },
    ],
  },
  {
    id: "3",
    name: "Downloads",
    type: "folder",
    children: [],
  },
];

export function App() {
  const treeRef = useRef<DraggableTreeRef>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (newData: TreeNode[]) => {
    console.log("Tree updated:", newData);
  };

  const handleItemClick = (node: TreeNode) => {
    console.log("Item clicked:", node);
  };

  const handleToggleExpand = () => {
    if (isExpanded) {
      treeRef.current?.collapseAll();
    } else {
      treeRef.current?.expandAll();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          可拖拽树形文件管理器
        </Typography>
        <Typography variant="body2" color="text.secondary">
          支持文件夹的拖拽排序，最里层文件夹不显示图标
        </Typography>
      </Box>

      <Box mb={2}>
        <Button variant="outlined" size="small" onClick={handleToggleExpand}>
          {isExpanded ? "全部折叠" : "全部展开"}
        </Button>
      </Box>

      <DraggableTree
        ref={treeRef}
        data={initialData}
        onChange={handleChange}
        onItemClick={handleItemClick}
      />
    </Container>
  );
}

const checkboxTreeData: CheckboxTreeNode[] = [
  {
    id: "c1",
    name: "Documents",
    type: "folder",
    children: [
      {
        id: "c1-1",
        name: "Work",
        type: "folder",
        children: [
          { id: "c1-1-1", name: "Reports", type: "folder", children: [] },
          { id: "c1-1-2", name: "Presentations", type: "folder", children: [] },
        ],
      },
      {
        id: "c1-2",
        name: "Personal",
        type: "folder",
        children: [
          { id: "c1-2-1", name: "Photos", type: "folder", children: [] },
        ],
      },
      { id: "c1-3", name: "Archive", type: "folder", children: [] },
    ],
  },
  {
    id: "c2",
    name: "Projects",
    type: "folder",
    children: [
      {
        id: "c2-1",
        name: "Project A",
        type: "folder",
        children: [
          { id: "c2-1-1", name: "Source", type: "folder", children: [] },
          { id: "c2-1-2", name: "Assets", type: "folder", children: [] },
        ],
      },
      {
        id: "c2-2",
        name: "Project B",
        type: "folder",
        children: [],
      },
    ],
  },
];

export function CheckboxTreeDemo() {
  const checkboxTreeRef = useRef<CheckboxTreeRef>(null);

  const handleCheckChange = (checkedIds: string[]) => {
    console.log("Checked IDs:", checkedIds);
  };

  const handleItemClick = (node: CheckboxTreeNode) => {
    console.log("Item clicked:", node);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          带复选框的树形组件
        </Typography>
        <Typography variant="body2" color="text.secondary">
          默认全部展开，只有叶子节点可勾选，父节点显示半选状态
        </Typography>
      </Box>

      <CheckboxTree
        ref={checkboxTreeRef}
        data={checkboxTreeData}
        onCheckChange={handleCheckChange}
        onItemClick={handleItemClick}
      />
    </Container>
  );
}

export function DataGridDemo() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          データ管理画面
        </Typography>
        <Typography variant="body2" color="text.secondary">
          承認・差戻し・削除機能付きデータグリッド
        </Typography>
      </Box>

      <DataGrid />
    </Container>
  );
}
