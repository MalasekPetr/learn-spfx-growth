"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUsers = void 0;
const react_1 = require("react");
const utils_1 = require("../utils");
const SELECT_FIELDS = 'displayName,givenName,surname,department,jobTitle,companyName,mail,mobilePhone,businessPhones,userPrincipalName';
const useUsers = (graphClient, searchText) => {
    const [allUsers, setAllUsers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(undefined);
    const [refreshKey, setRefreshKey] = (0, react_1.useState)(0);
    const fetchAllUsers = (0, react_1.useCallback)(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const collected = [];
            let nextLink = undefined;
            const response = await graphClient
                .api('/users')
                .select(SELECT_FIELDS)
                .top(100)
                .get();
            collected.push(...response.value);
            nextLink = response['@odata.nextLink'];
            while (nextLink) {
                const nextResponse = await graphClient
                    .api(nextLink)
                    .get();
                collected.push(...nextResponse.value);
                nextLink = nextResponse['@odata.nextLink'];
            }
            setAllUsers(collected);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setLoading(false);
        }
    }, [graphClient, refreshKey]);
    (0, react_1.useEffect)(() => {
        fetchAllUsers().catch(() => { });
    }, [fetchAllUsers]);
    const filteredUsers = searchText
        ? allUsers.filter((user) => {
            const normalized = (0, utils_1.normalizeText)(searchText);
            return ((0, utils_1.normalizeText)(user.displayName || '').includes(normalized) ||
                (0, utils_1.normalizeText)(user.department || '').includes(normalized) ||
                (0, utils_1.normalizeText)(user.jobTitle || '').includes(normalized) ||
                (0, utils_1.normalizeText)(user.mail || '').includes(normalized));
        })
        : allUsers;
    const refresh = (0, react_1.useCallback)(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);
    return { users: filteredUsers, loading, error, refresh };
};
exports.useUsers = useUsers;
//# sourceMappingURL=useUsers.js.map