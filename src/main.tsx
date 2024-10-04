import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from './pages/HomePage/HomePage.tsx'
import { ServiesPage } from './pages/ServicesPage/ServicesPage.tsx'
import './index.css'


const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage/>,
    errorElement: <h1>error 404 </h1>,
  },
  {
    path: '/services',
    element: <ServiesPage/>,
  }
])



createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router}/>
)
