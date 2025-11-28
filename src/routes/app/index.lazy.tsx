import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/app/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello World!</div>
}
