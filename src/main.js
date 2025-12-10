import "./global.css";
import { Router } from "./lib/router.js";

import { RootLayout } from "./layouts/root/layout.js";
import { The404Page } from "./pages/404/page.js";
import { SvgDemo1Page } from "./pages/svg-demo1/page.js";
import { SvgDemo2Page } from "./pages/svg-demo2/page.js";
import { SvgDemo3Page } from "./pages/svg-demo3/page.js";
import { SvgDemo4Page } from "./pages/svg-demo4/page.js";
import { SvgDemo5Page } from "./pages/svg-demo5/page.js";

// Exemple d'utilisation avec authentification

const router = new Router("app");

router.addLayout("/", RootLayout);


router.addRoute("/", SvgDemo1Page);
router.addRoute("/svg-demo1", SvgDemo1Page);

router.addRoute("/svg-demo2", SvgDemo2Page);


router.addRoute("/svg-demo3", SvgDemo3Page);
router.addRoute("/svg-demo4", SvgDemo4Page);

router.addRoute("/svg-demo5", SvgDemo5Page);

router.addRoute("*", The404Page);

// Démarrer le routeur
router.start();
