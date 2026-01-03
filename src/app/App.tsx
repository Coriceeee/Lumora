import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { RootState } from "../setup";

import { ThemeProvider as CoreThemeProvider } from "../_start/layout/core";

import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import muiTheme from "../theme/muiTheme";

import { MasterLayout } from "../_start/layout/MasterLayout";
import { Logout } from "./modules/auth/Logout";
import { PrivateRoutes } from "./routing/PrivateRoutes";
import { PublicRoutes } from "./routing/PublicRoutes";

type Props = {
  basename: string;
};

const App: React.FC<Props> = ({ basename }) => {
  const isAuthorized = useSelector<RootState, boolean>((state) =>
    Boolean(state.auth?.accessToken || state.auth?.user)
  );

  return (
    <BrowserRouter basename={basename}>
      {/* 🔴 CORE THEME – BẮT BUỘC */}
      <CoreThemeProvider>
        {/* 🟢 MUI THEME – FONT + TYPO */}
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />

          <Switch>
            <Route path="/logout" component={Logout} />
            {!isAuthorized ? (
              <Route>
                <PublicRoutes />
              </Route>
            ) : (
              <MasterLayout>
                <PrivateRoutes />
              </MasterLayout>
            )}
          </Switch>

        </MuiThemeProvider>
      </CoreThemeProvider>
    </BrowserRouter>
  );
};

export { App };
