package com.gdb.loans.security;

public class UserContextHolder {
    private static final ThreadLocal<UserContext> CONTEXT = new ThreadLocal<>();
    public static void setContext(UserContext ctx) { CONTEXT.set(ctx); }
    public static UserContext getContext() { return CONTEXT.get(); }
    public static void clearContext() { CONTEXT.remove(); }
}
