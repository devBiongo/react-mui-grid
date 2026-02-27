import { useState, useImperativeHandle, forwardRef } from "react";
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Checkbox,
} from "@mui/material";
import {
  ExpandMore,
  ChevronRight,
  Folder,
  FolderOpen,
} from "@mui/icons-material";

export interface CheckboxTreeNode {
  id: string;
  name: string;
  type: "folder";
  children?: CheckboxTreeNode[];
}

interface CheckboxTreeItemProps {
  node: CheckboxTreeNode;
  depth: number;
  onToggle: (id: string) => void;
  expanded: Set<string>;
  onItemClick?: (node: CheckboxTreeNode) => void;
  checked: Set<string>;
  indeterminate: Set<string>;
  onCheckChange: (id: string, isChecked: boolean, leafIds?: string[]) => void;
}

function CheckboxTreeItem({
  node,
  depth,
  onToggle,
  expanded,
  onItemClick,
  checked,
  indeterminate,
  onCheckChange,
}: CheckboxTreeItemProps) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = !hasChildren;
  const isChecked = checked.has(node.id);
  const isIndeterminate = indeterminate.has(node.id);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLeaf) {
      // Leaf node: toggle checked state
      onCheckChange(node.id, !isChecked);
    } else {
      // Parent node: check/uncheck all children
      const shouldCheck = !isChecked && !isIndeterminate;

      const getAllLeafIds = (n: CheckboxTreeNode): string[] => {
        if (!n.children || n.children.length === 0) {
          return [n.id];
        }
        return n.children.flatMap(getAllLeafIds);
      };

      const leafIds = getAllLeafIds(node);
      onCheckChange(node.id, shouldCheck, leafIds);
    }
  };

  return (
    <Box>
      <ListItem disablePadding sx={{ pl: depth * 3 }}>
        <ListItemButton
          sx={{ borderRadius: 2, py: 0.5, minHeight: 36 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
            onItemClick?.(node);
          }}
        >
          {!isLeaf && (
            <IconButton size="small" sx={{ mr: 0.5, p: 0.5 }}>
              {isExpanded ? (
                <ExpandMore fontSize="small" />
              ) : (
                <ChevronRight fontSize="small" />
              )}
            </IconButton>
          )}
          {isLeaf && <Box sx={{ width: 32 }} />}

          <Checkbox
            size="small"
            checked={isChecked}
            indeterminate={isIndeterminate}
            onClick={handleCheckboxClick}
            sx={{ p: 0.5, mr: 0.5 }}
          />

          <ListItemIcon sx={{ minWidth: 28 }}>
            {isExpanded && !isLeaf ? (
              <FolderOpen color="primary" fontSize="small" />
            ) : (
              <Folder color="primary" fontSize="small" />
            )}
          </ListItemIcon>

          <ListItemText
            primary={node.name}
            slotProps={{ primary: { fontSize: "0.875rem" } }}
          />
        </ListItemButton>
      </ListItem>

      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <CheckboxTreeLevel
            nodes={node.children!}
            depth={depth + 1}
            onToggle={onToggle}
            expanded={expanded}
            onItemClick={onItemClick}
            checked={checked}
            indeterminate={indeterminate}
            onCheckChange={onCheckChange}
          />
        </Collapse>
      )}
    </Box>
  );
}

interface CheckboxTreeLevelProps {
  nodes: CheckboxTreeNode[];
  depth: number;
  onToggle: (id: string) => void;
  expanded: Set<string>;
  onItemClick?: (node: CheckboxTreeNode) => void;
  checked: Set<string>;
  indeterminate: Set<string>;
  onCheckChange: (id: string, isChecked: boolean, leafIds?: string[]) => void;
}

function CheckboxTreeLevel({
  nodes,
  depth,
  onToggle,
  expanded,
  onItemClick,
  checked,
  indeterminate,
  onCheckChange,
}: CheckboxTreeLevelProps) {
  return (
    <List disablePadding dense>
      {nodes.map((node) => (
        <CheckboxTreeItem
          key={node.id}
          node={node}
          depth={depth}
          onToggle={onToggle}
          expanded={expanded}
          onItemClick={onItemClick}
          checked={checked}
          indeterminate={indeterminate}
          onCheckChange={onCheckChange}
        />
      ))}
    </List>
  );
}

interface CheckboxTreeProps {
  data: CheckboxTreeNode[];
  onItemClick?: (node: CheckboxTreeNode) => void;
  onCheckChange?: (checkedIds: string[]) => void;
}

export interface CheckboxTreeRef {
  expandAll: () => void;
  collapseAll: () => void;
  getCheckedIds: () => string[];
}

export const CheckboxTree = forwardRef<CheckboxTreeRef, CheckboxTreeProps>(
  ({ data, onItemClick, onCheckChange }, ref) => {
    const [treeData] = useState<CheckboxTreeNode[]>(data);
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [indeterminate, setIndeterminate] = useState<Set<string>>(new Set());

    // Initialize with all nodes expanded
    const getAllNodeIds = (nodes: CheckboxTreeNode[]): string[] => {
      const ids: string[] = [];
      const traverse = (nodeList: CheckboxTreeNode[]) => {
        nodeList.forEach((node) => {
          ids.push(node.id);
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        });
      };
      traverse(nodes);
      return ids;
    };

    const [expanded, setExpanded] = useState<Set<string>>(
      new Set(getAllNodeIds(treeData)),
    );

    // Get all parent IDs for a given node
    const getParentIds = (
      nodes: CheckboxTreeNode[],
      targetId: string,
      parents: string[] = [],
    ): string[] | null => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return parents;
        }
        if (node.children) {
          const result = getParentIds(node.children, targetId, [
            ...parents,
            node.id,
          ]);
          if (result) return result;
        }
      }
      return null;
    };

    // Update checked and indeterminate state for all nodes
    const updateCheckboxStates = (newChecked: Set<string>) => {
      const newIndeterminate = new Set<string>();
      const finalChecked = new Set(newChecked);

      const checkNode = (
        node: CheckboxTreeNode,
      ): {
        allChecked: boolean;
        someChecked: boolean;
        totalLeaves: number;
        checkedLeaves: number;
      } => {
        // If it's a leaf node
        if (!node.children || node.children.length === 0) {
          const isChecked = newChecked.has(node.id);
          return {
            allChecked: isChecked,
            someChecked: isChecked,
            totalLeaves: 1,
            checkedLeaves: isChecked ? 1 : 0,
          };
        }

        // For parent nodes, check all children
        const childResults = node.children.map(checkNode);
        const totalLeaves = childResults.reduce(
          (sum, r) => sum + r.totalLeaves,
          0,
        );
        const checkedLeaves = childResults.reduce(
          (sum, r) => sum + r.checkedLeaves,
          0,
        );

        const allChecked = checkedLeaves === totalLeaves && totalLeaves > 0;
        const someChecked = checkedLeaves > 0;

        if (allChecked) {
          // All children checked - parent should be checked
          finalChecked.add(node.id);
        } else if (someChecked) {
          // Some children checked - parent should be indeterminate
          newIndeterminate.add(node.id);
          finalChecked.delete(node.id);
        } else {
          // No children checked - parent should be unchecked
          finalChecked.delete(node.id);
        }

        return {
          allChecked,
          someChecked,
          totalLeaves,
          checkedLeaves,
        };
      };

      treeData.forEach(checkNode);
      setChecked(finalChecked);
      setIndeterminate(newIndeterminate);
    };

    const handleCheckChange = (
      id: string,
      isChecked: boolean,
      leafIds?: string[],
    ) => {
      const newChecked = new Set(checked);

      if (leafIds) {
        // Parent node clicked - toggle all leaf children
        if (isChecked) {
          leafIds.forEach((leafId) => newChecked.add(leafId));
        } else {
          leafIds.forEach((leafId) => newChecked.delete(leafId));
        }
      } else {
        // Leaf node clicked
        if (isChecked) {
          newChecked.add(id);
        } else {
          newChecked.delete(id);
        }
      }

      updateCheckboxStates(newChecked);

      // Only return leaf node IDs in callback
      const leafOnlyIds = Array.from(newChecked).filter((nodeId) => {
        const findNode = (
          nodes: CheckboxTreeNode[],
          targetId: string,
        ): CheckboxTreeNode | null => {
          for (const node of nodes) {
            if (node.id === targetId) return node;
            if (node.children) {
              const found = findNode(node.children, targetId);
              if (found) return found;
            }
          }
          return null;
        };
        const node = findNode(treeData, nodeId);
        return node && (!node.children || node.children.length === 0);
      });

      onCheckChange?.(leafOnlyIds);
    };

    const handleToggle = (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      expandAll: () => {
        const allIds = getAllNodeIds(treeData);
        setExpanded(new Set(allIds));
      },
      collapseAll: () => {
        setExpanded(new Set());
      },
      getCheckedIds: () => {
        return Array.from(checked);
      },
    }));

    return (
      <Paper elevation={2} sx={{ p: 2 }}>
        <CheckboxTreeLevel
          nodes={treeData}
          depth={0}
          onToggle={handleToggle}
          expanded={expanded}
          onItemClick={onItemClick}
          checked={checked}
          indeterminate={indeterminate}
          onCheckChange={handleCheckChange}
        />
      </Paper>
    );
  },
);

CheckboxTree.displayName = "CheckboxTree";
