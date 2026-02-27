import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { Box, Button, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

interface RowData {
  id: number;
  title: string;
  status: string;
  workDate: string;
  lastUpdater: string;
  type: string;
  isPublic: boolean;
}

const ActionCellRenderer = (props: ICellRendererParams) => {
  const handleApprove = () => {
    console.log("承認:", props.data);
  };

  const handleReturn = () => {
    console.log("差戻し:", props.data);
  };

  const handleDelete = () => {
    console.log("削除:", props.data);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ height: "100%", alignItems: "center" }}
    >
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={handleApprove}
      >
        承認
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="warning"
        onClick={handleReturn}
      >
        差戻し
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        onClick={handleDelete}
      >
        削除
      </Button>
    </Stack>
  );
};

interface DataGridProps {
  onRowSelected?: (row: any) => void;
}

export function DataGrid({ onRowSelected }: DataGridProps) {
  const [rowData, setRowData] = useState<RowData[]>([
    {
      id: 1,
      title: "プロジェクト提案書",
      status: "承認待ち",
      workDate: "2024-01-15",
      lastUpdater: "山田太郎",
      type: "提案",
      isPublic: true,
    },
    {
      id: 2,
      title: "月次報告書",
      status: "作成中",
      workDate: "2024-01-20",
      lastUpdater: "佐藤花子",
      type: "報告",
      isPublic: false,
    },
    {
      id: 3,
      title: "予算計画",
      status: "承認済み",
      workDate: "2024-01-10",
      lastUpdater: "鈴木一郎",
      type: "計画",
      isPublic: true,
    },
    {
      id: 4,
      title: "業務改善提案",
      status: "差戻し",
      workDate: "2024-01-18",
      lastUpdater: "田中美咲",
      type: "提案",
      isPublic: false,
    },
    {
      id: 5,
      title: "四半期レビュー",
      status: "承認待ち",
      workDate: "2024-01-22",
      lastUpdater: "高橋健太",
      type: "報告",
      isPublic: true,
    },
  ]);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "No",
        valueGetter: "node.rowIndex + 1",
        width: 50,
        pinned: "left",
        filter: false,
        cellStyle: {
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      {
        field: "title",
        headerName: "タイトル",
        flex: 2,
        minWidth: 200,
        editable: true,
      },
      {
        field: "status",
        headerName: "ステータス",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "workDate",
        headerName: "作業日",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "lastUpdater",
        headerName: "最終更新者",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "type",
        headerName: "種別",
        flex: 1,
        minWidth: 100,
      },
      {
        field: "isPublic",
        headerName: "公開",
        flex: 1,
        minWidth: 80,
        valueGetter: (params) => (params.data?.isPublic ? "公開" : "非公開"),
      },
      {
        headerName: "アクション",
        cellRenderer: ActionCellRenderer,
        flex: 2,
        minWidth: 280,
        pinned: "right",
        sortable: false,
        filter: false,
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      },
    }),
    [],
  );

  const onCellValueChanged = (event: any) => {
    console.log("Cell value changed:", event.data);
    // 这里可以添加保存到后端的逻辑
  };

  const onRowClicked = (event: any) => {
    console.log("Row clicked:", event.data);
    onRowSelected?.(event.data);
  };

  return (
    <Box sx={{ width: "100%", height: "600px" }}>
      <style>
        {`
          .ag-theme-quartz {
            --ag-header-background-color: #1976d2;
            --ag-header-foreground-color: white;
            --ag-odd-row-background-color: #f5f5f5;
            --ag-row-hover-color: #e3f2fd;
            --ag-selected-row-background-color: #bbdefb;
            --ag-border-color: #e0e0e0;
            --ag-font-size: 14px;
            --ag-header-height: 50px;
            --ag-row-height: 60px;
          }
          .ag-theme-quartz .ag-header-cell {
            font-weight: 600;
          }
          .ag-theme-quartz .ag-paging-panel {
            border-top: 2px solid #1976d2;
            background-color: #fafafa;
            padding: 12px 20px;
            font-size: 14px;
          }
          .ag-theme-quartz .ag-paging-button {
            margin: 0 4px;
          }
        `}
      </style>
      <div
        className="ag-theme-quartz"
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <AgGridReact
          modules={[AllCommunityModule]}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowHeight={60}
          headerHeight={50}
          animateRows={true}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          paginationAutoPageSize={false}
          onCellValueChanged={onCellValueChanged}
          onRowClicked={onRowClicked}
          rowSelection="single"
        />
      </div>
    </Box>
  );
}
