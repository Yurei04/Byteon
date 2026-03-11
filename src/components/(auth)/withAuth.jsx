"use client"

import RequireAuth from "./requireAuth"
import RequireRole from "./requireRole"

// export default withAuth(MyPage)                        → any logged-in user
// export default withAuth(MyPage, ["org_admin"])         → org admin only
// export default withAuth(MyPage, ["user", "org_admin"]) → both roles
export function withAuth(Component, roles = []) {
  return function AuthProtected(props) {
    return (
      <RequireAuth>
        <RequireRole roles={roles}>
          <Component {...props} />
        </RequireRole>
      </RequireAuth>
    )
  }
}