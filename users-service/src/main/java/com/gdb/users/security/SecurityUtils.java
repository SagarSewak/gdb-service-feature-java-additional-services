package com.gdb.users.security;

import com.gdb.users.constants.UserConstants;

public class SecurityUtils {

    public static void checkAdminRole() {
        UserContext context = UserContextHolder.getContext();
        if (context == null || !UserConstants.ROLE_ADMIN.equals(context.getRole())) {
            throw new RuntimeException("ACCESS_DENIED");
        }
    }

    public static void checkAdminOrTellerRole() {
        UserContext context = UserContextHolder.getContext();
        if (context == null)
            throw new RuntimeException("ACCESS_DENIED");

        String role = context.getRole();
        if (!UserConstants.ROLE_ADMIN.equals(role) && !UserConstants.ROLE_TELLER.equals(role)) {
            throw new RuntimeException("ACCESS_DENIED");
        }
    }

    public static void checkAnyAuthorizedRole() {
        UserContext context = UserContextHolder.getContext();
        if (context == null) {
            throw new RuntimeException("ACCESS_DENIED");
        }
    }
}
