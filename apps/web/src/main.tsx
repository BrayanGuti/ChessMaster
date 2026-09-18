import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from './pages/HomePage/HomePage.tsx'
import { ServiesPage } from './pages/ServicesPage/ServicesPage.tsx'
import { Error404Page } from './pages/Error404Page/Error404Page.tsx'
import './index.css'


const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage/>,
    errorElement: <Error404Page/>,
  },
  {
    path: '/services',
    element: <ServiesPage/>,
  }
])



createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router}/>
)
