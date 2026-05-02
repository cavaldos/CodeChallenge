import { lazy } from 'react';
import MainLayout from '~/Layout/MainLayout';

const Home = lazy(() => import('~/pages/home'));
const Login = lazy(() => import('~/pages/login'));
const Campaigns = lazy(() => import('~/pages/campaigns'));
const CampaignNew = lazy(() => import('~/pages/campaign-new'));
const CampaignDetail = lazy(() => import('~/pages/campaign-detail'));

const PrivateRouter = [
  {
    name: 'Campaigns',
    icon: '',
    path: '/campaigns',
    component: Campaigns,
    Layout: MainLayout,
  },
  {
    name: 'Campaign New',
    icon: '',
    path: '/campaigns/new',
    component: CampaignNew,
    Layout: MainLayout,
  },
  {
    name: 'Campaign Detail',
    icon: '',
    path: '/campaigns/:id',
    component: CampaignDetail,
    Layout: MainLayout,
  },
];


const PublicRouter = [
  {
    name: 'Home',
    icon: '',
    path: '/',
    component: Home,
    Layout: null,
  },
  {
    name: 'Login',
    icon: '',
    path: '/login',
    component: Login,
    Layout: null,
  },
];

export { PrivateRouter, PublicRouter };
