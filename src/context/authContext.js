import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./authReducer";

const INITIAL_STATE = {
    token: localStorage.getItem("token"),
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

    useEffect(() => {
        localStorage.setItem("token", state.token);
    }, [state.token]);

    return (
        <AuthContext.Provider value={{ token: state.token, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
