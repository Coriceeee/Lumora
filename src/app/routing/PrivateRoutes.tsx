import { Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { FallbackView } from "../../_start/partials";

import { LightDashboardWrapper } from "../pages/dashboards/light-dashboard/LightDashboardWrapper";
import { StartDashboardWrapper } from "../pages/dashboards/start-dashboard/StartDashboardWrapper";
import { MenuTestPage } from "../pages/MenuTestPage";

import DanhMucLoaiDiem from "../pages/DanhMucLoaiDiem";
import DanhMucMonHoc from "../pages/DanhMucMonHoc";
import DanhMucKyNang from "../pages/DanhMucKyNang";
import DanhMucChungChi from "../pages/DanhMucChungChi";

import KetQuaHocTapForm from "../pages/vireya/KetQuaHocTap";
import HoSoHocTapPage from "../pages/vireya/HoSoHocTap";
import PhanTichHoSoHocTapPage from "../pages/vireya/PhanTichHoSoHocTapPage";
import LearningDashboardPage from "../pages/vireya/LearningDashboardPage";

import HoSoCaNhan from "../pages/neovana/HoSoCaNhan";
import PhanTichNangLucPage from "../pages/neovana/PhanTichNangLucPage";
import DinhHuongPhatTrien from "../pages/neovana/DinhHuongPhatTrienPage";

import VoidZone from "../pages/zenora/VoidZone";
import CloudWhisper from "../pages/zenora/CloudWhisper";

import { MindfulGardenComponent } from "../pages/ayura/MindfulGarden";
import { AyuraCoreProvider } from "../pages/ayura/AyuraCoreProvider";

import RobokiLinks from "../pages/RobokiLinks";
import RobokiEmbedPage from "../pages/RobokiEmbedPage";

export function PrivateRoutes() {
  const ProfilePageWrapper = lazy(() =>
    import("../modules/profile/ProfilePageWrapper")
  );
  const GeneralPageWrapper = lazy(() =>
    import("../modules/general/GeneralPageWrapper")
  );
  const DocsPageWrapper = lazy(() =>
    import("../modules/docs/DocsPageWrapper")
  );

  return (
    <Suspense fallback={<FallbackView />}>
      <Switch>
        <Route path="/dashboard" component={StartDashboardWrapper} />
        <Route path="/light" component={LightDashboardWrapper} />
        <Route path="/general" component={GeneralPageWrapper} />
        <Route path="/profile" component={ProfilePageWrapper} />
        <Route path="/menu-test" component={MenuTestPage} />
        <Route path="/docs" component={DocsPageWrapper} />

        {/* Danh Mục */}
        <Route path="/danh-muc/loai-diem" component={DanhMucLoaiDiem} />
        <Route path="/danh-muc/mon-hoc" component={DanhMucMonHoc} />
        <Route path="/danh-muc/chung-chi" component={DanhMucChungChi} />
        <Route path="/danh-muc/ky-nang" component={DanhMucKyNang} />

        {/* Vireya */}
        <Route path="/vireya/ket-qua-hoc-tap" component={KetQuaHocTapForm} />
        <Route path="/vireya/ho-so-hoc-tap" component={HoSoHocTapPage} />
        <Route path="/vireya/danh-gia-trinh-do" component={LearningDashboardPage} />
        <Route path="/vireya/phan-tich-ho-so-hoc-tap" component={PhanTichHoSoHocTapPage} />

        {/* Neovana */}
        <Route path="/neovana/ho-so-ca-nhan" component={HoSoCaNhan} />
        <Route path="/neovana/phan-tich-nang-luc" component={PhanTichNangLucPage} />
        <Route path="/neovana/dinh-huong-phat-trien" component={DinhHuongPhatTrien} />

        {/* Ayura */}
        <Route
          path="/ayura/vuon-chua-lanh"
          render={() => (
            <AyuraCoreProvider>
              <MindfulGardenComponent />
            </AyuraCoreProvider>
          )}
        />

        {/* Zenora */}
        <Route path="/zenora/void-zone" component={VoidZone} />
        <Route path="/zenora/cloud-whisper" component={CloudWhisper} />

        {/* ⭐ 4 mục Roboki mở iframe */}
        <Route path="/roboki/embed/hotro" component={RobokiEmbedPage} />
        <Route path="/roboki/embed/thietke" component={RobokiEmbedPage} />
        <Route path="/roboki/embed/tuduy" component={RobokiEmbedPage} />
        <Route path="/roboki/embed/giasu" component={RobokiEmbedPage} />

        {/* ⭐ 6 ô đánh giá năng lực */}
        <Route path="/roboki/danh-gia-nang-luc" component={RobokiLinks} />

        {/* ⭐ route embed chung */}
        <Route path="/roboki/embed/:id" component={RobokiEmbedPage} />

        {/* Redirect */}
        <Redirect from="/auth" to="/dashboard" />
        <Redirect exact from="/" to="/dashboard" />
        <Redirect to="/dashboard" />

      </Switch>
    </Suspense>
  );
}
