"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOneDrive = void 0;
const react_1 = require("react");
const useOneDrive = (graphClient) => {
    const [items, setItems] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(undefined);
    const [breadcrumb, setBreadcrumb] = (0, react_1.useState)([
        { id: 'root', name: 'OneDrive' }
    ]);
    const currentFolderId = breadcrumb[breadcrumb.length - 1].id;
    const fetchItems = (0, react_1.useCallback)(async (folderId) => {
        setLoading(true);
        setError(undefined);
        try {
            const endpoint = folderId === 'root'
                ? '/me/drive/root/children'
                : `/me/drive/items/${folderId}/children`;
            const response = await graphClient
                .api(endpoint)
                .select('id,name,size,lastModifiedDateTime,webUrl,folder,file')
                .orderby('name')
                .get();
            setItems(response.value);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            setItems([]);
        }
        finally {
            setLoading(false);
        }
    }, [graphClient]);
    (0, react_1.useEffect)(() => {
        void fetchItems(currentFolderId);
    }, [currentFolderId, fetchItems]);
    const navigateToFolder = (0, react_1.useCallback)((folderId, folderName) => {
        setBreadcrumb(prev => [...prev, { id: folderId, name: folderName }]);
    }, []);
    const navigateToBreadcrumb = (0, react_1.useCallback)((index) => {
        setBreadcrumb(prev => prev.slice(0, index + 1));
    }, []);
    const refresh = (0, react_1.useCallback)(() => {
        void fetchItems(currentFolderId);
    }, [currentFolderId, fetchItems]);
    return { items, loading, error, breadcrumb, navigateToFolder, navigateToBreadcrumb, refresh };
};
exports.useOneDrive = useOneDrive;
//# sourceMappingURL=useOneDrive.js.map