#!/usr/bin/env python3
"""Python control/diagnostic console for one user-authorized Android phone.

Safe commands are read-only. Commands that interact with the UI or change data
require --confirm. This is an ADB client, not root or a security bypass.
"""
from __future__ import annotations
import argparse, json, os, re, shutil, subprocess, sys, time
from pathlib import Path

DEFAULT_ADB = Path(r"C:\tmp\android-platform-tools\platform-tools\adb.exe")

def adb_path(value=None):
    for p in (value, os.getenv("ADB_PATH"), shutil.which("adb"), str(DEFAULT_ADB)):
        if p and Path(p).is_file(): return str(Path(p))
    raise RuntimeError("adb not found; use --adb PATH")

class Phone:
    def __init__(self, adb, serial=None): self.adb, self.serial = adb, serial
    def run(self, *args, binary=False, timeout=30):
        cmd=[self.adb];
        if self.serial: cmd += ["-s", self.serial]
        cmd += list(args)
        r=subprocess.run(cmd, capture_output=True, timeout=timeout, check=False,
                         **({} if binary else {"text":True,"encoding":"utf-8","errors":"replace"}))
        if r.returncode: raise RuntimeError((r.stderr or r.stdout or b"adb error").decode(errors="replace") if binary else (r.stderr or r.stdout).strip())
        return r.stdout if binary else r.stdout.strip()
    def shell(self,*args,**kw): return self.run("shell",*args,**kw)
    def prop(self,key): return self.shell("getprop",key)
    def ensure(self):
        rows=[x.split() for x in self.run("devices").splitlines()[1:] if x.strip()]
        ready=[x for x in rows if len(x)>1 and x[1]=="device"]
        if not ready: raise RuntimeError("no authorized ADB device")
        if not self.serial and len(ready)>1: raise RuntimeError("multiple devices; use --serial")
    def summary(self):
        keys={"maker":"ro.product.manufacturer","model":"ro.product.model","product":"ro.product.name",
              "android":"ro.build.version.release","api":"ro.build.version.sdk","build":"ro.build.display.id",
              "patch":"ro.build.version.security_patch","soc":"ro.soc.model","hardware":"ro.hardware",
              "abis":"ro.product.cpu.abilist","verified_boot":"ro.boot.verifiedbootstate","locked":"ro.boot.flash.locked"}
        return {k:self.prop(v) for k,v in keys.items()}
    def report(self):
        return {"summary":self.summary(),"display":self.shell("wm","size")+"; "+self.shell("wm","density"),
                "battery":parse_pairs(self.shell("dumpsys","battery"),{"level","scale","status","health","plugged","temperature","voltage"}),
                "storage":self.shell("df","-h","/data"),"memory":first_lines(self.shell("cat","/proc/meminfo"),5),
                "wifi":sanitize_wifi(self.shell("cmd","wifi","status")),"hotspot":hotspot_state(self.shell("dumpsys","tethering")),
                "features":[x.removeprefix("feature:") for x in self.shell("pm","list","features").splitlines()]}

def first_lines(s,n): return s.splitlines()[:n]
def parse_pairs(s,wanted):
    out={}
    for line in s.splitlines():
        if ":" in line:
            k,v=map(str.strip,line.split(":",1))
            if k in wanted: out[k]=v
    return out
def sanitize_wifi(s):
    low=s.lower()
    return {"enabled":"wifi is enabled" in low,"connected":"wifi is connected" in low and "not connected" not in low,
            "scanning":"wifi scanning is always available" in low,"note":"SSID/BSSID/MAC/IP omitted"}
def hotspot_state(s):
    def value(pattern):
        m=re.search(pattern,s,re.I|re.M); return m.group(1).strip() if m else None
    upstream=value(r"^\s*Current upstream interface\(s\):\s*(.+)$")
    clients=re.findall(r"client",s,re.I)
    return {"supported":bool(re.search(r"tetherableWifiRegexs:\s*\[[^]]+",s)),
            "active":value(r"^\s*Upstream wanted:\s*(true|false)$")=="true",
            "cellular_permitted":value(r"^\s*isCellularUpstreamPermitted:\s*(true|false)$")=="true",
            "upstream":None if upstream in (None,"null") else "active (identifier hidden)",
            "client_information_present":len(clients)>1,
            "privacy_note":"SSID, password, interfaces and client identifiers omitted"}
def require(confirm, action):
    if not confirm: raise RuntimeError(f"{action} changes or interacts with the phone; repeat with --confirm")
def safe_remote(path):
    if not path.startswith("/sdcard/") or ".." in path.split("/"): raise RuntimeError("remote path must be inside /sdcard and contain no '..'")
    return path

def main():
    p=argparse.ArgumentParser(description="Deep but consent-based MAO-LX9 ADB console")
    p.add_argument("--adb"); p.add_argument("--serial"); p.add_argument("--confirm",action="store_true")
    sub=p.add_subparsers(dest="cmd",required=True)
    sub.add_parser("summary"); sub.add_parser("report"); sub.add_parser("features"); sub.add_parser("sensors")
    sub.add_parser("processes"); sub.add_parser("packages"); sub.add_parser("routes"); sub.add_parser("hotspot")
    sub.add_parser("tether-settings")
    settings=sub.add_parser("open-settings"); settings.add_argument("intent")
    shot=sub.add_parser("screenshot"); shot.add_argument("output",type=Path)
    logs=sub.add_parser("logcat"); logs.add_argument("output",type=Path); logs.add_argument("--seconds",type=int,default=5)
    pull=sub.add_parser("pull"); pull.add_argument("remote"); pull.add_argument("local",type=Path)
    push=sub.add_parser("push"); push.add_argument("local",type=Path); push.add_argument("remote")
    launch=sub.add_parser("open-url"); launch.add_argument("url")
    key=sub.add_parser("key"); key.add_argument("keycode",type=int)
    text=sub.add_parser("text"); text.add_argument("value")
    secret=sub.add_parser("replace-focused-password"); secret.add_argument("value")
    install=sub.add_parser("install"); install.add_argument("apk",type=Path)
    uninstall=sub.add_parser("uninstall"); uninstall.add_argument("package")
    args=p.parse_args()
    try:
        ph=Phone(adb_path(args.adb),args.serial); ph.ensure()
        if args.cmd=="summary": print(json.dumps(ph.summary(),indent=2))
        elif args.cmd=="report": print(json.dumps(ph.report(),indent=2))
        elif args.cmd=="features": print(ph.shell("pm","list","features"))
        elif args.cmd=="sensors": print(ph.shell("dumpsys","sensorservice"))
        elif args.cmd=="processes": print(ph.shell("ps","-A"))
        elif args.cmd=="packages": print(ph.shell("pm","list","packages","-f"))
        elif args.cmd=="routes": print(ph.shell("ip","route"))
        elif args.cmd=="hotspot": print(json.dumps(hotspot_state(ph.shell("dumpsys","tethering")),indent=2))
        elif args.cmd=="tether-settings": require(args.confirm,"opening tether settings"); print(ph.shell("am","start","-a","android.settings.TETHER_SETTINGS"))
        elif args.cmd=="open-settings":
            require(args.confirm,"opening system settings")
            allowed={
                "android.settings.WIFI_SETTINGS","android.settings.BLUETOOTH_SETTINGS","android.settings.DISPLAY_SETTINGS",
                "android.settings.SOUND_SETTINGS","android.settings.BATTERY_SAVER_SETTINGS","android.settings.INTERNAL_STORAGE_SETTINGS",
                "android.settings.LOCATION_SOURCE_SETTINGS","android.settings.SECURITY_SETTINGS","android.settings.APPLICATION_SETTINGS",
                "android.settings.APPLICATION_DEVELOPMENT_SETTINGS"
            }
            if args.intent not in allowed: raise RuntimeError("settings intent is not allowed")
            print(ph.shell("am","start","-a",args.intent))
        elif args.cmd=="screenshot": args.output.write_bytes(ph.run("exec-out","screencap","-p",binary=True)); print(args.output)
        elif args.cmd=="logcat":
            if not 1<=args.seconds<=60: raise RuntimeError("--seconds must be 1..60")
            require(args.confirm,"log capture (may contain personal data)"); ph.run("logcat","-c"); time.sleep(args.seconds); args.output.write_text(ph.run("logcat","-d","-v","threadtime"),encoding="utf-8"); print(args.output)
        elif args.cmd=="pull": safe_remote(args.remote); print(ph.run("pull",args.remote,str(args.local)))
        elif args.cmd=="push": require(args.confirm,"file upload"); safe_remote(args.remote); print(ph.run("push",str(args.local),args.remote))
        elif args.cmd=="open-url": require(args.confirm,"opening a URL"); print(ph.shell("am","start","-a","android.intent.action.VIEW","-d",args.url))
        elif args.cmd=="key": require(args.confirm,"key injection"); print(ph.shell("input","keyevent",str(args.keycode)))
        elif args.cmd=="text": require(args.confirm,"text injection"); print(ph.shell("input","text",args.value.replace(" ","%s")))
        elif args.cmd=="replace-focused-password":
            require(args.confirm,"password field replacement")
            if not re.fullmatch(r"[A-Za-z0-9._@#+=!-]{8,63}",args.value): raise RuntimeError("use 8-63 characters: letters, numbers, . _ @ # + = ! -")
            ph.shell("input","keycombination","113","29")
            print(ph.shell("input","text",args.value))
        elif args.cmd=="install": require(args.confirm,"APK installation"); print(ph.run("install",str(args.apk)))
        elif args.cmd=="uninstall": require(args.confirm,"app uninstall"); print(ph.run("uninstall",args.package))
        return 0
    except (RuntimeError,subprocess.TimeoutExpired,OSError) as e: print(f"error: {e}",file=sys.stderr); return 2
if __name__=="__main__": raise SystemExit(main())
