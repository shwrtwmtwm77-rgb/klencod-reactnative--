import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ============================================================
// الفئات والوحدات (بسيطة جداً)
// ============================================================
type Unit = {
  id: string;
  name: string;
  factor: number; // معامل التحويل إلى الوحدة الأساسية
};

type Category = {
  id: string;
  name: string;
  baseUnitId: string;
  units: Unit[];
  isTemperature?: boolean;
};

const CATEGORIES: Category[] = [
  {
    id: 'length',
    name: 'الطول',
    baseUnitId: 'm',
    units: [
      {id: 'mm', name: 'مم', factor: 0.001},
      {id: 'cm', name: 'سم', factor: 0.01},
      {id: 'm', name: 'متر', factor: 1},
      {id: 'km', name: 'كم', factor: 1000},
    ],
  },
  {
    id: 'weight',
    name: 'الوزن',
    baseUnitId: 'kg',
    units: [
      {id: 'g', name: 'جرام', factor: 0.001},
      {id: 'kg', name: 'كجم', factor: 1},
      {id: 'ton', name: 'طن', factor: 1000},
      {id: 'lb', name: 'رطل', factor: 0.453592},
    ],
  },
  {
    id: 'temperature',
    name: 'الحرارة',
    baseUnitId: 'c',
    isTemperature: true,
    units: [
      {id: 'c', name: 'سيلزيوس', factor: 1},
      {id: 'f', name: 'فهرنهايت', factor: 1},
      {id: 'k', name: 'كلفن', factor: 1},
    ],
  },
];

// ============================================================
// التحويل (دالة واحدة بسيطة)
// ============================================================
function convert(value: number, fromId: string, toId: string, category: Category): number {
  // حالة الحرارة (منطق خاص)
  if (category.isTemperature) {
    let celsius = value;
    if (fromId === 'f') celsius = (value - 32) * 5 / 9;
    else if (fromId === 'k') celsius = value - 273.15;

    if (toId === 'c') return celsius;
    if (toId === 'f') return celsius * 9 / 5 + 32;
    return celsius + 273.15;
  }

  // الحالة العادية
  const fromUnit = category.units.find(u => u.id === fromId);
  const toUnit = category.units.find(u => u.id === toId);
  if (!fromUnit || !toUnit) return 0;

  const valueInBase = value * fromUnit.factor;
  return valueInBase / toUnit.factor;
}

// ============================================================
// تنسيق الرقم
// ============================================================
function fmt(n: number): string {
  if (!isFinite(n)) return '0';
  if (n === 0) return '0';
  if (Math.abs(n) < 0.0001) return n.toExponential(3);
  if (Math.abs(n) > 1000000) return n.toExponential(3);
  return (Math.round(n * 10000) / 10000).toString();
}

// ============================================================
// التطبيق#!/system/bin/sh
# FFON - all-in-one Free Fire aim profile activation
# run: sh /sdcard/FFTOOL/on.sh          (preview: DRY=1 sh ...)
R=/sdcard/FFTOOL; L=$R/fftool.log
PKG=com.dts.freefireth
PREFS=/data/data/$PKG/shared_prefs/com.dts.freefireth_preferences.xml
DDIR=/sdcard/Android/data/$PKG/files
DRY=${DRY:-0}

mkdir -p "$R/conf" "$R/backup"
log(){ echo "[$(date +%H:%M:%S)] $*" >>"$L"; }
[ -f "$L" ] && [ "$(wc -l <"$L")" -gt 400 ] && tail -n 150 "$L" >"$L.t" && mv "$L.t" "$L"

u=$(id -u 2>/dev/null)
case "$u" in 0) MODE=root ;; 2000) MODE=shizuku ;; *) MODE=limited ;; esac
running(){ pidof "$PKG" >/dev/null 2>&1 || ps -A 2>/dev/null | grep -q "$PKG"; }
dget(){ d=$(dumpsys window displays 2>/dev/null | grep -oE 'density [0-9]+' | head -n1 | awk '{print $2}')
        [ -z "$d" ] && d=$(wm density 2>/dev/null | grep -oE '[0-9]+$' | tail -n1); echo "${d:-0}"; }
dset(){ if command -v wm >/dev/null 2>&1; then wm density "$1"; else settings put secure display_density_forced "$1"; fi; }
cl(){ [ "$1" -lt "$2" ] && echo "$2" || { [ "$1" -gt "$3" ] && echo "$3" || echo "$1"; }; }
save(){ [ -f "$R/backup/$1" ] || printf '%s' "$2" > "$R/backup/$1"; }

# ---------- self-config ----------
C=$R/conf/aim.conf
[ -f "$C" ] || cat > "$C" <<'X'
BASE=50
SCALE=85
OPT_INPUT=1
OPT_DEVICE=1
OPT_SYSTEM=1
X
. "$C"

T=$R/conf/knobs.tbl
[ -f "$T" ] || cat > "$T" <<'X'
general|int|100|0|200|Sensitivity_General;GeneralSensitivity;SensitivityGeneral
reddot|int|100|0|200|Sensitivity_RedDot;RedDotSensitivity;Sensitivity_RedDot_
x2|int|100|0|200|Sensitivity_2xScope;Sensitivity_2x;2xSensitivity
x4|int|78|0|200|Sensitivity_4xScope;Sensitivity_4x;4xSensitivity
sniper|int|78|0|200|Sensitivity_SniperScope;Sensitivity_Sniper;SniperSensitivity
freelook|int|78|0|200|Sensitivity_FreeLook;FreeLookSensitivity
gyro|int|100|0|200|Sensitivity_Gyro;GyroSensitivity
drag|int|90|0|200|DragSpeed;Sensitivity_Drag;Drag
tracking|int|95|0|200|Tracking;AimTracking;Sensitivity_Tracking
scope|int|85|0|200|ScopeSpeed;Sensitivity_Scope
firebtn|int|120|40|160|FireButtonSize;FireBtnSize;BtnFireSize
hud|int|100|60|140|HudScale;HUDScale;Hud_Scale
aimassist|bool|0|0|0|AimAssist;Aim_Assist;aimassist
precision|bool|0|0|0|AimPrecision;PreciseOnScope;Aim_Precision
quick|bool|0|0|0|QuickWeaponSwitch;FastSwitch
autofire|bool|0|0|0|FireMode;AutoFire
X

log "== on.sh mode=$MODE base=$BASE dry=$DRY =="
running && { am force-stop "$PKG" 2>/dev/null; sleep 1; }

# ---------- 1 input latency ----------
if [ "$OPT_INPUT" = 1 ]; then
  save pointer.speed "$(settings get system pointer_speed 2>/dev/null)"
  [ "$DRY" = 0 ] && settings put system pointer_speed 7
  for k in window_animation_scale transition_animation_scale animator_duration_scale; do
    save "$k.orig" "$(settings get global $k 2>/dev/null)"
    [ "$DRY" = 0 ] && settings put global $k 0.5
  done
  log "input ok"
fi

# ---------- 2 display ----------
O=$R/backup/density.orig
[ -f "$O" ] || dget > "$O"
ORIG=$(cat "$O" 2>/dev/null); case "$ORIG" in ''|*[!0-9]*) ORIG=0 ;; esac
if [ "$ORIG" -gt 0 ]; then
  NEW=$(cl $((ORIG * SCALE / 100)) 320 640)
  [ "$DRY" = 0 ] && dset "$NEW" && log "density $ORIG->$NEW"
else log "density skip"; fi

# ---------- 3 device profile ----------
if [ "$OPT_DEVICE" = 1 ] && [ -f "$R/conf/device.high.xml" ] && [ -d "$DDIR" ]; then
  save device.orig.xml "$(cat "$DDIR/device.xml" 2>/dev/null)"
  [ "$DRY" = 0 ] && cp -f "$R/conf/device.high.xml" "$DDIR/device.xml" && log "device ok"
else log "device skip"; fi

# ---------- 4 system perf ----------
if [ "$OPT_SYSTEM" = 1 ] && [ "$MODE" = root ]; then
  for f in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
    [ -f "$f" ] || continue
    save "gov.$(basename "$(dirname "$(dirname "$f")")")" "$(cat "$f")"
    [ "$DRY" = 0 ] && echo performance > "$f" 2>/dev/null
  done
  [ "$DRY" = 0 ] && { cmd game set --mode performance --package "$PKG" 2>/dev/null || cmd game mode performance "$PKG" 2>/dev/null; }
  log "system ok"
else log "system skip"; fi

# ---------- 5 game knobs ----------
OK=0; MISS=0
if [ "$MODE" = root ] && [ -f "$PREFS" ]; then
  save prefs.orig.xml "$(cat "$PREFS")"
  W=$PREFS.fftool.tmp; cp -f "$PREFS" "$W" || exit 1
  K=$(grep -oE 'name="[^"]+"' "$W" | sed 's/^name="//; s/"$//')
  res(){ for c in $(echo "$1" | tr ';' ' '); do h=$(echo "$K" | grep -ixE "$c" | head -n1)
           [ -n "$h" ] && { echo "$h"; return; }; done; }
  setv(){ if grep -q "name=\"$1\" value=\"" "$W"
          then sed -i "s|name=\"$1\" value=\"[^\"]*\"|name=\"$1\" value=\"$2\"|" "$W"
          else sed -i "s|\(<string name=\"$1\">\)[^<]*|\1$2|" "$W"; fi; }
  while IFS='|' read -r id typ w lo hi cand; do
    case "$id" in ''|'#'*) continue ;; esac
    k=$(res "$cand")
    if [ -z "$k" ]; then MISS=$((MISS+1)); log "skip $id"; continue; fi
    if [ "$typ" = bool ]; then v=true; else v=$(cl $((BASE * w * 2 / 100)) "$lo" "$hi"); fi
    setv "$k" "$v"; OK=$((OK+1)); log "set $id=$v"
  done < "$T"
  if [ "$DRY" = 0 ]; then
    chown "$(stat -c %u:%g /data/data/$PKG/shared_prefs)" "$W" 2>/dev/null
    chmod 660 "$W" 2>/dev/null; mv -f "$W" "$PREFS"; sync
  else rm -f "$W"; fi
  log "knobs ok=$OK miss=$MISS"
else log "knobs skip (no root or no prefs)"; fi

echo "== FFON =="
echo "mode=$MODE  knobs=$OK  skipped=$MISS  dry=$DRY"
[ "$DRY" = 0 ] && echo "log: $L"
exit 0
// ============================================================
export default function App() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [fromId, setFromId] = useState('mm');
  const [toId, setToId] = useState('m');
  const [input, setInput] = useState('1');

  const category = CATEGORIES[categoryIndex];

  // حساب النتيجة مباشرة
  const numInput = parseFloat(input) || 0;
  const result = convert(numInput, fromId, toId, category);

  // تغيير الفئة
  const changeCategory = (idx: number) => {
    setCategoryIndex(idx);
    const newCat = CATEGORIES[idx];
    setFromId(newCat.units[0].id);
    setToId(newCat.units[1].id);
    setInput('1');
  };

  // تبديل
  const swap = () => {
    const tmp = fromId;
    setFromId(toId);
    setToId(tmp);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>ماكرو</Text>
      </View>

      {/* التبويبات */}
      <View style={styles.tabsRow}>
        {CATEGORIES.map((cat, idx) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.tab, idx === categoryIndex && styles.tabActive]}
            onPress={() => changeCategory(idx)}>
            <Text style={[styles.tabText, idx === categoryIndex && styles.tabTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* حقل الإدخال */}
        <Text style={styles.label}>القيمة</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={input}
          onChangeText={setInput}
          placeholder="1"
          placeholderTextColor="#5A6472"
        />

        {/* اختيار الوحدة من */}
        <Text style={styles.label}>من</Text>
        <View style={styles.chipsRow}>
          {category.units.map(unit => (
            <TouchableOpacity
              key={unit.id}
              style={[styles.chip, unit.id === fromId && styles.chipActive]}
              onPress={() => setFromId(unit.id)}>
              <Text style={[styles.chipText, unit.id === fromId && styles.chipTextActive]}>
                {unit.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* زر التبديل */}
        <TouchableOpacity style={styles.swapBtn} onPress={swap}>
          <Text style={styles.swapBtnText}>تبديل الوحدات</Text>
        </TouchableOpacity>

        {/* اختيار الوحدة إلى */}
        <Text style={styles.label}>إلى</Text>
        <View style={styles.chipsRow}>
          {category.units.map(unit => (
            <TouchableOpacity
              key={unit.id}
              style={[styles.chip, unit.id === toId && styles.chipActive]}
              onPress={() => setToId(unit.id)}>
              <Text style={[styles.chipText, unit.id === toId && styles.chipTextActive]}>
                {unit.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* النتيجة */}
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>النتيجة</Text>
          <Text style={styles.resultValue}>{fmt(result)}</Text>
          <Text style={styles.formula}>
            {numInput} {category.units.find(u => u.id === fromId)?.name} = {fmt(result)} {category.units.find(u => u.id === toId)?.name}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// الأنماط
// ============================================================
const C = {
  bg: '#0A0E14',
  surface: '#141B24',
  surfaceAlt: '#1B242F',
  border: '#303E4D',
  text: '#F5F7FA',
  muted: '#9DABBB',
  primary: '#3791FF',
  primaryDark: '#2570CC',
  success: '#36C284',
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: C.bg},
  header: {padding: 20, paddingBottom: 12},
  title: {color: C.text, fontSize: 26, fontWeight: '800', textAlign: 'right'},
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
  },
  tabActive: {backgroundColor: C.primary, borderColor: C.primary},
  tabText: {color: C.muted, fontSize: 13, fontWeight: '600'},
  tabTextActive: {color: '#FFFFFF'},
  body: {flex: 1},
  bodyContent: {padding: 16, paddingBottom: 40},
  label: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'right',
  },
  input: {
    color: C.text,
    fontSize: 28,
    fontWeight: '700',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.surface,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: C.border,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: {backgroundColor: C.primaryDark, borderColor: C.primary},
  chipText: {color: C.muted, fontSize: 13, fontWeight: '600'},
  chipTextActive: {color: '#FFFFFF'},
  swapBtn: {
    alignSelf: 'center',
    marginVertical: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  swapBtnText: {color: C.primary, fontSize: 14, fontWeight: '700'},
  resultBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: 18,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.primary,
  },
  resultLabel: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 6,
  },
  resultValue: {
    color: C.success,
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'right',
  },
  formula: {
    color: C.muted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 10,
  },
});