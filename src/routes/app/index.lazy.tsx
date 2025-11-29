import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/app/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Bienvenue dans Memora !</div>
}
