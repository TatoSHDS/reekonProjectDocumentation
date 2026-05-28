import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import DocumentationView from '../views/DocumentationView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/fine-tuning-cli'
  },
  {
    path: '/:slug',
    name: 'documentation',
    component: DocumentationView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
