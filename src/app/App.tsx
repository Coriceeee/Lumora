import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { RootState } from "../setup";
import { ThemeProvider } from "../_start/layout/core";
import { MasterLayout } from "../_start/layout/MasterLayout";
import { Logout } from "./modules/auth/Logout";
import { PrivateRoutes } from "./routing/PrivateRoutes";
import { PublicRoutes } from "./routing/PublicRoutes";

type Props = {
  basename: string;
};

const App: React.FC<Props> = ({ basename }) => {
  // ✅ Xem là đã đăng nhập nếu có token HOẶC có user trong Redux
  const isAuthorized = useSelector<RootState, boolean>((state) =>
    Boolean(
      state.auth?.accessToken || // nếu bạn lưu ở đây
      state.auth?.user           // hoặc bạn đã set user
    )
  );

  return (
    <BrowserRouter basename={basename}>
      <ThemeProvider>
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
      </ThemeProvider>
    </BrowserRouter>
  );
};

export { App };
