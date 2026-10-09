import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

// تحميل كسول: لا يزيد حجم الحزمة الأولى للمنصة
const IslamicHubPage = lazy(() => import('./pages/IslamicHub/IslamicHubPage'));
const ValuesPage = lazy(() => import('./pages/Values/ValuesPage'));
const MannersPage = lazy(() => import('./pages/Manners/MannersPage'));
const WorshipPage = lazy(() => import('./pages/Worship/WorshipPage'));
const FaithPage = lazy(() => import('./pages/Faith/FaithPage'));
const StoriesPage = lazy(() => import('./pages/Stories/StoriesPage'));
const CulturePage = lazy(() => import('./pages/Culture/CulturePage'));
const StepByStepPage = lazy(() => import('./pages/StepByStep/StepByStepPage'));
const GamesPage = lazy(() => import('./pages/Games/GamesPage'));
const QuizPage = lazy(() => import('./pages/Quiz/QuizPage'));
const BadgesPage = lazy(() => import('./pages/Badges/BadgesPage'));

const Loading: React.FC = () => (
  <div dir="rtl" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem' }}>
    🌙
  </div>
);

const wrap = (el: React.ReactElement): React.ReactElement => <Suspense fallback={<Loading />}>{el}</Suspense>;

const ROUTE_TABLE: { path: string; element: React.ReactElement }[] = [
  { path: '/islamic', element: wrap(<IslamicHubPage />) },
  { path: '/islamic/values', element: wrap(<ValuesPage initialTab="values" />) },
  { path: '/islamic/family', element: wrap(<ValuesPage initialTab="family" />) },
  { path: '/islamic/manners', element: wrap(<MannersPage />) },
  { path: '/islamic/worship', element: wrap(<WorshipPage />) },
  { path: '/islamic/faith', element: wrap(<FaithPage />) },
  { path: '/islamic/stories', element: wrap(<StoriesPage />) },
  { path: '/islamic/culture', element: wrap(<CulturePage />) },
  { path: '/islamic/steps', element: wrap(<StepByStepPage />) },
  { path: '/islamic/challenge', element: wrap(<GamesPage />) },
  { path: '/islamic/quiz/:worldId', element: wrap(<QuizPage />) },
  { path: '/islamic/badges', element: wrap(<BadgesPage />) },
];

/** للاستخدام داخل <Routes>:  {islamicRouteElements} */
export const islamicRouteElements = (
  <>
    {ROUTE_TABLE.map((r) => (
      <Route key={r.path} path={r.path} element={r.element} />
    ))}
  </>
);

/** للاستخدام مع createBrowserRouter / useRoutes */
export const islamicRoutes: RouteObject[] = ROUTE_TABLE.map((r) => ({ path: r.path, element: r.element }));
