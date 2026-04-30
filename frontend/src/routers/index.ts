import { lazy } from 'react'
import MainLayout from '~/Layout/MainLayout'

const Home = lazy(() => import('~/pages/home'))


const MainRouter = [
    {
        name: 'Dashboard',
        icon: '',
        path: '/',
        component: Home,
        Layout: MainLayout,
    }

]

export default MainRouter;