import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "context/AuthContext";
import ProtectedRoute from "components/ProtectedRoute";
import theme from "theme/theme.js";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";
import RTLLayout from "layouts/RTL.js";

ReactDOM.render(
  <ChakraProvider theme={theme} resetCss={false} position="relative">
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route path={`/auth`} component={AuthLayout} />
          <ProtectedRoute path={`/admin`} component={AdminLayout} roles={["admin", "elu"]} />
          <Route path={`/rtl`} component={RTLLayout} />
          <Redirect from={`/`} to="/admin/dashboard" />
        </Switch>
      </AuthProvider>
    </BrowserRouter>
  </ChakraProvider>,
  document.getElementById("root")
);
