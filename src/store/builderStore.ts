import { create } from 'zustand';
import { COMPONENT_REGISTRY } from '@/config/components';

export type ComponentType = 'Heading' | 'Text' | 'Button' | 'Image' | 'Card' | 'Divider' | 'List' | 'Container';

export interface ComponentInstance {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  parentId: string; // "root" for top-level components
  childrenIds?: string[];
}

// Our page structure is a flat map of id -> ComponentInstance and an ordered list of IDs for the root zone.
// A real app might have multiple drop zones, but we'll stick to a single main column ("root") for simplicity.
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface BuilderState {
  components: Record<string, ComponentInstance>;
  rootList: string[];
  selectedId: string | null; // '__canvas__' = canvas is selected
  canvasStyle: Record<string, string>;
  deviceMode: DeviceMode;
  isPreviewMode: boolean;
  pageId: string | null;

  // Actions
  addComponent: (type: ComponentType, parentId?: string, index?: number) => void;
  moveComponent: (id: string, newIndex: number) => void;
  updateProps: (id: string, newProps: Partial<Record<string, any>>) => void;
  updateCanvasStyle: (newStyle: Record<string, string>) => void;
  setSelected: (id: string | null) => void;
  removeComponent: (id: string) => void;
  setFullState: (components: Record<string, ComponentInstance>, rootList: string[]) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  setIsPreviewMode: (isPreview: boolean) => void;
  setPageId: (id: string | null) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useBuilderStore = create<BuilderState>((set) => ({
  components: {},
  rootList: [],
  selectedId: null,
  canvasStyle: {},
  deviceMode: 'desktop',
  isPreviewMode: false,
  pageId: null,

  addComponent: (type, parentId = 'root', index) => set((state) => {
    const id = generateId();
    // Pull defaultProps directly from the component registry so they stay in sync
    const defaultProps = { ...(COMPONENT_REGISTRY[type]?.defaultProps ?? {}) };

    const newComponent: ComponentInstance = { id, type, props: defaultProps, parentId };
    
    const newRootList = [...state.rootList];
    if (index !== undefined && index >= 0 && index <= newRootList.length) {
      newRootList.splice(index, 0, id);
    } else {
      newRootList.push(id);
    }
    
    return {
      components: { ...state.components, [id]: newComponent },
      rootList: newRootList,
      selectedId: id, // Auto-select newly added component
    };
  }),

  moveComponent: (id, newIndex) => set((state) => {
    const oldIndex = state.rootList.indexOf(id);
    if (oldIndex === -1) return state;

    const newRootList = [...state.rootList];
    newRootList.splice(oldIndex, 1);
    newRootList.splice(newIndex, 0, id);

    return { rootList: newRootList };
  }),

  updateProps: (id, newProps) => set((state) => {
    if (id === '__canvas__') {
      // If AI or properties panel updates canvas, route it to canvasStyle.
      // AI usually nests styles in `style`, but handle direct props just in case.
      const styleUpdates = newProps.style ? newProps.style : newProps;
      return {
        canvasStyle: { ...state.canvasStyle, ...styleUpdates }
      };
    }

    const comp = state.components[id];
    if (!comp) return state;

    return {
      components: {
        ...state.components,
        [id]: {
          ...comp,
          props: { ...comp.props, ...newProps }
        }
      }
    };
  }),

  updateCanvasStyle: (newStyle) => set((state) => ({
    canvasStyle: { ...state.canvasStyle, ...newStyle },
  })),

  setSelected: (id) => set({ selectedId: id }),

  removeComponent: (id) => set((state) => {
    const newComponents = { ...state.components };
    const compToDelete = newComponents[id];
    delete newComponents[id];

    let newRootList = state.rootList;
    if (compToDelete?.parentId === 'root') {
      newRootList = state.rootList.filter((cId) => cId !== id);
    } else if (compToDelete?.parentId && newComponents[compToDelete.parentId]) {
      const parent = newComponents[compToDelete.parentId];
      newComponents[compToDelete.parentId] = {
        ...parent,
        childrenIds: parent.childrenIds?.filter((childId) => childId !== id)
      };
    }

    return {
      components: newComponents,
      rootList: newRootList,
      selectedId: state.selectedId === id ? null : state.selectedId,
    };
  }),

  setFullState: (components, rootList) => set({ components, rootList, selectedId: null }),

  setDeviceMode: (deviceMode) => set({ deviceMode }),
  setIsPreviewMode: (isPreviewMode) => set({ 
    isPreviewMode, 
    selectedId: isPreviewMode ? null : undefined 
  }),
  setPageId: (pageId) => set({ pageId }),

}));
