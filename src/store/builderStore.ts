import { create } from 'zustand';
import { ShadcnTheme, SHADCN_THEMES, DEFAULT_THEME_ID } from '@/lib/themes';
import { COMPONENT_REGISTRY, ComponentType } from '@/config/components';

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

export interface HistoryState {
  components: Record<string, ComponentInstance>;
  rootList: string[];
  canvasStyle: Record<string, string>;
}

export interface BuilderState {
  components: Record<string, ComponentInstance>;
  rootList: string[];
  selectedId: string | null; // '__canvas__' = canvas is selected
  selectedField: string | null; // e.g. 'headline' or 'features.0.title'
  canvasStyle: Record<string, string>;
  deviceMode: DeviceMode;
  isPreviewMode: boolean;
  pageId: string | null;
  theme: ShadcnTheme | null;
  hasUnsavedChanges: boolean;

  past: HistoryState[];
  future: HistoryState[];

  // Actions
  addComponent: (type: ComponentType, parentId?: string, index?: number) => void;
  moveComponent: (id: string, newIndex: number) => void;
  updateProps: (id: string, newProps: Partial<Record<string, any>>) => void;
  updateCanvasStyle: (newStyle: Record<string, string>) => void;
  setSelected: (id: string | null, fieldKey?: string | null) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  setFullState: (components: Record<string, ComponentInstance>, rootList: string[]) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  setIsPreviewMode: (isPreview: boolean) => void;
  setPageId: (id: string | null) => void;
  setTheme: (theme: ShadcnTheme | null) => void;
  setHasUnsavedChanges: (hasUnsaved: boolean) => void;
  
  undo: () => void;
  redo: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const captureHistory = (state: BuilderState) => ({
  past: [
    ...state.past,
    { components: state.components, rootList: state.rootList, canvasStyle: state.canvasStyle }
  ],
  future: []
});

export const useBuilderStore = create<BuilderState>((set, get) => ({
  components: {},
  rootList: [],
  selectedId: null,
  selectedField: null,
  canvasStyle: {},
  deviceMode: 'desktop',
  isPreviewMode: false,
  pageId: null,
  theme: SHADCN_THEMES[DEFAULT_THEME_ID],
  hasUnsavedChanges: false,
  
  past: [],
  future: [],

  undo: () => set((state) => {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);
    const newFuture = [
      { components: state.components, rootList: state.rootList, canvasStyle: state.canvasStyle },
      ...state.future
    ];
    return {
      components: previous.components,
      rootList: previous.rootList,
      canvasStyle: previous.canvasStyle,
      past: newPast,
      future: newFuture,
      hasUnsavedChanges: true,
      selectedId: null,
      selectedField: null
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    const newPast = [
      ...state.past,
      { components: state.components, rootList: state.rootList, canvasStyle: state.canvasStyle }
    ];
    return {
      components: next.components,
      rootList: next.rootList,
      canvasStyle: next.canvasStyle,
      past: newPast,
      future: newFuture,
      hasUnsavedChanges: true,
      selectedId: null,
      selectedField: null
    };
  }),

  addComponent: (type, parentId = 'root', index) => set((state) => {
    const id = generateId();
    const defaultProps = { ...(COMPONENT_REGISTRY[type]?.defaultProps ?? {}) };
    const newComponent: ComponentInstance = { id, type, props: defaultProps, parentId };
    
    const newRootList = [...state.rootList];
    if (index !== undefined && index >= 0 && index <= newRootList.length) {
      newRootList.splice(index, 0, id);
    } else {
      newRootList.push(id);
    }
    
    return {
      ...captureHistory(state),
      components: { ...state.components, [id]: newComponent },
      rootList: newRootList,
      selectedId: id,
      selectedField: null,
      hasUnsavedChanges: true,
    };
  }),

  duplicateComponent: (id) => set((state) => {
    const compToDuplicate = state.components[id];
    if (!compToDuplicate || compToDuplicate.parentId !== 'root') return state; // Only root components for now
    
    const newId = generateId();
    const newComponent: ComponentInstance = { 
      ...compToDuplicate, 
      id: newId, 
      props: JSON.parse(JSON.stringify(compToDuplicate.props)) // deep copy
    };
    
    const newRootList = [...state.rootList];
    const oldIndex = state.rootList.indexOf(id);
    newRootList.splice(oldIndex + 1, 0, newId);

    return {
      ...captureHistory(state),
      components: { ...state.components, [newId]: newComponent },
      rootList: newRootList,
      selectedId: newId,
      selectedField: null,
      hasUnsavedChanges: true,
    };
  }),

  moveComponent: (id, newIndex) => set((state) => {
    const oldIndex = state.rootList.indexOf(id);
    if (oldIndex === -1) return state;

    const newRootList = [...state.rootList];
    newRootList.splice(oldIndex, 1);
    newRootList.splice(newIndex, 0, id);

    return { 
      ...captureHistory(state),
      rootList: newRootList, 
      hasUnsavedChanges: true 
    };
  }),

  updateProps: (id, newProps) => set((state) => {
    if (id === '__canvas__') {
      const styleUpdates = newProps.style ? newProps.style : newProps;
      return {
        ...captureHistory(state),
        canvasStyle: { ...state.canvasStyle, ...styleUpdates },
        hasUnsavedChanges: true
      };
    }

    const comp = state.components[id];
    if (!comp) return state;

    return {
      ...captureHistory(state),
      components: {
        ...state.components,
        [id]: {
          ...comp,
          props: { ...comp.props, ...newProps }
        }
      },
      hasUnsavedChanges: true
    };
  }),

  updateCanvasStyle: (newStyle) => set((state) => ({
    ...captureHistory(state),
    canvasStyle: { ...state.canvasStyle, ...newStyle },
    hasUnsavedChanges: true
  })),

  setSelected: (id, fieldKey) => set({ selectedId: id, selectedField: fieldKey || null }),

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
      ...captureHistory(state),
      components: newComponents,
      rootList: newRootList,
      selectedId: state.selectedId === id ? null : state.selectedId,
      hasUnsavedChanges: true,
    };
  }),

  setFullState: (components, rootList) => set({ 
    components, 
    rootList, 
    selectedId: null, 
    hasUnsavedChanges: false,
    past: [],
    future: []
  }),

  setDeviceMode: (deviceMode) => set({ deviceMode }),
  setIsPreviewMode: (isPreviewMode) => set({ 
    isPreviewMode, 
    selectedId: isPreviewMode ? null : undefined,
    selectedField: isPreviewMode ? null : undefined 
  }),
  setPageId: (pageId) => set({ pageId }),
  setTheme: (theme) => set({ theme, hasUnsavedChanges: true }),
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),

}));

