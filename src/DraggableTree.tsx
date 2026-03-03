import { useState, useImperativeHandle, forwardRef } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
} from "@mui/material";
import {
  ExpandMore,
  ChevronRight,
  Folder,
  FolderOpen,
} from "@mui/icons-material";

export interface TreeNode {
  id: string;
  name: string;
  type: "folder";
  children?: TreeNode[];
}

interface SortableTreeItemProps {
  node: TreeNode;
  depth: number;
  onToggle: (id: string) => void;
  expanded: Set<string>;
  onItemClick?: (node: TreeNode) => void;
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
}

function SortableTreeItem({
  node,
  depth,
  onToggle,
  expanded,
  onItemClick,
  selectedNodeId,
  onSelect,
}: SortableTreeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = !hasChildren;
  const isSelected = selectedNodeId === node.id;

  return (
    <Box ref={setNodeRef} style={style}>
      <ListItem
        disablePadding
        sx={{ pl: depth * 3 }}
        {...attributes}
        {...listeners}
      >
        <ListItemButton
          sx={{
            borderRadius: 2,
            py: 0.5,
            minHeight: 36,
            bgcolor: isSelected ? "action.selected" : "transparent",
            "&:hover": {
              bgcolor: isSelected ? "action.selected" : "action.hover",
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
            onSelect(node.id);
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
          <TreeLevel
            nodes={node.children!}
            depth={depth + 1}
            onToggle={onToggle}
            expanded={expanded}
            onItemClick={onItemClick}
            selectedNodeId={selectedNodeId}
            onSelect={onSelect}
          />
        </Collapse>
      )}
    </Box>
  );
}

interface TreeLevelProps {
  nodes: TreeNode[];
  depth: number;
  onToggle: (id: string) => void;
  expanded: Set<string>;
  onItemClick?: (node: TreeNode) => void;
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
}

function TreeLevel({
  nodes,
  depth,
  onToggle,
  expanded,
  onItemClick,
  selectedNodeId,
  onSelect,
}: TreeLevelProps) {
  return (
    <SortableContext
      items={nodes.map((n) => n.id)}
      strategy={verticalListSortingStrategy}
    >
      <List disablePadding dense>
        {nodes.map((node) => (
          <SortableTreeItem
            key={node.id}
            node={node}
            depth={depth}
            onToggle={onToggle}
            expanded={expanded}
            onItemClick={onItemClick}
            selectedNodeId={selectedNodeId}
            onSelect={onSelect}
          />
        ))}
      </List>
    </SortableContext>
  );
}

interface DraggableTreeProps {
  data: TreeNode[];
  onChange?: (data: TreeNode[]) => void;
  onItemClick?: (node: TreeNode) => void;
}

export interface DraggableTreeRef {
  expandAll: () => void;
  collapseAll: () => void;
  moveUp: () => void;
  moveDown: () => void;
  getSelectedNode: () => TreeNode | null;
}

export const DraggableTree = forwardRef<DraggableTreeRef, DraggableTreeProps>(
  ({ data, onChange, onItemClick }, ref) => {
    const [treeData, setTreeData] = useState<TreeNode[]>(data);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      }),
    );

    // Collect all node IDs recursively
    const getAllNodeIds = (nodes: TreeNode[]): string[] => {
      const ids: string[] = [];
      const traverse = (nodeList: TreeNode[]) => {
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

    // Find node and its parent array
    const findNodeLocation = (
      nodes: TreeNode[],
      targetId: string,
      parent: TreeNode[] | null = null,
    ): { node: TreeNode; parent: TreeNode[]; index: number } | null => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === targetId) {
          return { node: nodes[i], parent: parent || nodes, index: i };
        }
        if (nodes[i].children) {
          const result = findNodeLocation(
            nodes[i].children!,
            targetId,
            nodes[i].children!,
          );
          if (result) return result;
        }
      }
      return null;
    };

    // Move node up in its parent array
    const moveNodeUp = () => {
      if (!selectedNodeId) return;

      const newTree = JSON.parse(JSON.stringify(treeData)) as TreeNode[];
      const location = findNodeLocation(newTree, selectedNodeId);

      if (!location || location.index === 0) return; // Already at top

      const { parent, index } = location;
      [parent[index - 1], parent[index]] = [parent[index], parent[index - 1]];

      setTreeData(newTree);
      onChange?.(newTree);
    };

    // Move node down in its parent array
    const moveNodeDown = () => {
      if (!selectedNodeId) return;

      const newTree = JSON.parse(JSON.stringify(treeData)) as TreeNode[];
      const location = findNodeLocation(newTree, selectedNodeId);

      if (!location || location.index === location.parent.length - 1) return; // Already at bottom

      const { parent, index } = location;
      [parent[index], parent[index + 1]] = [parent[index + 1], parent[index]];

      setTreeData(newTree);
      onChange?.(newTree);
    };

    // Get selected node
    const getSelectedNode = (): TreeNode | null => {
      if (!selectedNodeId) return null;
      const location = findNodeLocation(treeData, selectedNodeId);
      return location ? location.node : null;
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
      moveUp: moveNodeUp,
      moveDown: moveNodeDown,
      getSelectedNode,
    }));

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

    const findNodeAndParent = (
      nodes: TreeNode[],
      id: string,
      parent: TreeNode[] | null = null,
    ): { node: TreeNode; parent: TreeNode[] | null; index: number } | null => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          return { node: nodes[i], parent, index: i };
        }
        if (nodes[i].children) {
          const result = findNodeAndParent(
            nodes[i].children!,
            id,
            nodes[i].children!,
          );
          if (result) return result;
        }
      }
      return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
      setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) return;

      const newTree = JSON.parse(JSON.stringify(treeData)) as TreeNode[];

      const activeResult = findNodeAndParent(newTree, active.id as string);
      const overResult = findNodeAndParent(newTree, over.id as string);

      if (
        !activeResult ||
        !overResult ||
        !activeResult.parent ||
        !overResult.parent
      )
        return;

      // Only allow reordering within the same parent
      if (activeResult.parent === overResult.parent) {
        const parent = activeResult.parent;
        const oldIndex = activeResult.index;
        const newIndex = overResult.index;

        const [removed] = parent.splice(oldIndex, 1);
        parent.splice(newIndex, 0, removed);

        setTreeData(newTree);
        onChange?.(newTree);
      }
    };

    const activeNode = activeId
      ? findNodeAndParent(treeData, activeId)?.node
      : null;

    return (
      <Paper elevation={2} sx={{ p: 2 }}>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <TreeLevel
            nodes={treeData}
            depth={0}
            onToggle={handleToggle}
            expanded={expanded}
            onItemClick={onItemClick}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
          />

          <DragOverlay>
            {activeNode && (
              <Paper elevation={4} sx={{ p: 0.5 }}>
                <Box display="flex" alignItems="center">
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Folder color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={activeNode.name}
                    slotProps={{ primary: { fontSize: "0.875rem" } }}
                  />
                </Box>
              </Paper>
            )}
          </DragOverlay>
        </DndContext>
      </Paper>
    );
  },
);

DraggableTree.displayName = "DraggableTree";
