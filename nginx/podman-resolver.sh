#!/bin/sh
# docker's embedded dns sits at 127.0.0.11, rootless podman has no such address - patch in whatever nameserver the runtime actually handed us
ns=$(awk '/^nameserver/ { print $2; exit }' /etc/resolv.conf)
[ "$ns" = "127.0.0.11" ] && exit 0
find /etc/nginx -name '*.conf' -exec sed -i "s/127\.0\.0\.11/$ns/" {} +