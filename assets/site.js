(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (!page || page === "") page = "index.html";

  document.querySelectorAll(".site-nav a, .top-actions a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").split("/").pop();
    if (href === page) a.setAttribute("aria-current", "page");
  });

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        btn.textContent = "복사됨";
        setTimeout(function () { btn.textContent = "복사"; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, selectMail);
      } else {
        selectMail();
      }
    });
  });

  function selectMail() {
    var el = document.getElementById("mail");
    if (!el) return;
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  var $ = function (id) { return document.getElementById(id); };
  var on = function (id) {
    var el = $(id);
    return !!(el && el.checked);
  };

  var navi = $("navi-form");
  if (navi) {
    var lastOut = [];
    var lastPlan = null;
    var BADGE = {
      must: ["b-must", "의무"],
      soon: ["b-soon", "예정"],
      check: ["b-check", "확인 필요"],
      rec: ["b-rec", "권장"]
    };

    function diagnose() {
      var sector = $("q-sector").value;
      var hasIsms = on("h-isms");
      var hasIsmsp = on("h-ismsp");
      var hasIso = on("h-iso");
      var certified = hasIsms || hasIsmsp;
      var out = [];
      lastOut = out;

      if (on("q-rev") || on("q-users") || on("q-infra")) {
        out.push(certified
          ? ["must", "ISMS 인증 유지(의무대상)", "의무대상에 해당합니다. 매년 사후심사와 3년 주기 갱신심사를 받아야 합니다."]
          : ["must", "ISMS 인증 취득(의무대상)", "정보통신망법상 의무대상으로 보입니다. 인증을 받지 않으면 3,000만 원 이하 과태료 대상입니다."]);
      } else if (sector === "medical" || sector === "univ") {
        out.push(["check", "ISMS 의무대상 여부", "연간 매출액 또는 세입 1,500억 원 이상인 상급종합병원·재학생 1만 명 이상 대학은 의무대상입니다."]);
      }

      if (on("q-pii")) {
        out.push(hasIsmsp
          ? ["soon", "ISMS-P 강화 기준 대비", "2027년 등급제·예비심사·기술심사가 적용됩니다. 다음 심사 전에 핵심 통제 점검이 필요합니다."]
          : ["soon", "ISMS-P 의무화 대상 가능성 (2027.07 예정)", "중요 개인정보처리자 대상 의무화가 예정되어 있습니다. 대상 기준은 고시로 확정될 예정입니다." + (hasIsms ? " 보유 중인 ISMS에 개인정보 21개 항목을 더해 전환할 수 있습니다." : "")]);
      }

      if (certified && !(on("q-pii") && hasIsmsp)) {
        out.push(["soon", "2027 인증 심사 개편 대비", "보유 인증의 다음 심사부터 예비심사·기술심사·사후관리 강화가 적용될 수 있습니다."]);
      }

      if (on("q-ai")) {
        out.push(["must", "AI 기본법 의무 검토 (2026.01.22 시행)", "생성형 AI 결과물 표시, 고영향 AI 해당 여부와 사업자 책무를 검토해야 합니다."]);
        if (on("q-global")) out.push(["rec", "ISO/IEC 42001 (AI 경영시스템)", "해외 고객에게 AI 거버넌스 수준을 증명할 수 있는 국제 인증입니다."]);
      }

      if (on("q-cloud")) {
        out.push(["must", "클라우드 보안인증(CSAP)", "공공기관이 이용하는 클라우드 서비스는 CSAP 인증이 필요합니다. 서비스 유형과 등급에 따라 요건이 다릅니다."]);
      }

      if (hasIso) {
        out.push(["check", "ISO 27001:2022 전환 여부", "2013판 인증은 2025년 10월 31일에 효력이 끝났습니다. 2022판으로 전환되었는지 확인하세요."]);
      } else if (on("q-global")) {
        out.push(["rec", "ISO/IEC 27001" + (on("q-pii") ? "·27701" : ""), "해외 고객사와 계약할 때 보안 수준 증명 자료로 가장 많이 요구됩니다." + (certified ? " 보유 인증과 매핑해 중복 작업을 줄일 수 있습니다." : "")]);
      }

      if (on("q-listed") || on("q-infra") || on("q-users") || sector === "medical") {
        out.push(["check", "정보보호 공시 의무 여부", "매출·이용자 규모와 업종에 따라 정보보호 투자·인력 현황을 매년 공시해야 할 수 있습니다."]);
      }

      if (sector === "finance") {
        out.push(["check", "전자금융 관련 규정", "전자금융거래법·전자금융감독규정에 따른 별도 보안 요구사항과 평가 대상 여부를 확인해야 합니다."]);
      }

      var list = $("r-list");
      list.textContent = "";
      if (!out.length) {
        var empty = document.createElement("li");
        empty.className = "r-empty";
        empty.textContent = "선택한 조건으로는 의무 대상이 보이지 않습니다. 개인정보를 처리한다면 개인정보 보호법의 안전성 확보조치 기준은 모든 조직에 적용됩니다.";
        list.appendChild(empty);
      }
      var counts = { must: 0, soon: 0, check: 0, rec: 0 };
      out.forEach(function (row) {
        counts[row[0]]++;
        var li = document.createElement("li");
        li.className = "r-item";
        var badge = document.createElement("span");
        badge.className = "r-badge " + BADGE[row[0]][0];
        badge.textContent = BADGE[row[0]][1];
        var body = document.createElement("div");
        var title = document.createElement("h3");
        title.textContent = row[1];
        var desc = document.createElement("p");
        desc.textContent = row[2];
        body.appendChild(title);
        body.appendChild(desc);
        li.appendChild(badge);
        li.appendChild(body);
        list.appendChild(li);
      });
      $("r-sum").innerHTML = out.length
        ? "의무 <b>" + counts.must + "</b> · 예정 <b>" + counts.soon + "</b> · 확인 필요 <b>" + counts.check + "</b> · 권장 <b>" + counts.rec + "</b>"
        : "";
    }

    var PHASES = [
      { w: -30, name: "착수·범위 정의", key: true },
      { w: -28, name: "현황 분석·GAP" },
      { w: -24, name: "위험평가·DoA 결정" },
      { w: -22, name: "보호대책·정책 제·개정" },
      { w: -18, name: "관리체계 운영 시작·임직원 교육", note: "신청 전 2개월 이상 운영" },
      { w: -12, name: "내부점검·모의심사" },
      { w: -9, name: "인증 신청", key: true },
      { w: -6, name: "인증기관 예비점검", note: "심사 6~8주 전" },
      { w: 0, name: "인증심사 시작", key: true },
      { w: 10, name: "인증서 발급 예상", note: "보완조치·인증위원회 심의 후" }
    ];
    var DAY = 86400000;
    var schedRanges = [];

    function fmt(d) {
      return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
    }

    function parseIso(value) {
      if (!value) return null;
      var parts = value.split("-");
      return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    }

    function addDays(d, n) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    }

    function buildRanges(target, today) {
      var starts = PHASES.map(function (phase) {
        return {
          start: new Date(target.getTime() + phase.w * 7 * DAY),
          name: phase.name,
          note: phase.note || "",
          key: !!phase.key,
          w: phase.w
        };
      });
      return starts.map(function (item, i) {
        var end = i < starts.length - 1
          ? addDays(starts[i + 1].start, -1)
          : addDays(item.start, 13);
        if (end < item.start) end = item.start;
        var days = Math.round((end - item.start) / DAY) + 1;
        return {
          start: item.start,
          end: end,
          days: days,
          name: item.name,
          note: item.note,
          key: item.key,
          past: end < today,
          tone: i % 6,
          off: (item.w === 0 ? "심사일" : (item.w < 0 ? "심사 " + (-item.w) + "주 전" : "심사 " + item.w + "주 후")) + (item.note ? " · " + item.note : "")
        };
      });
    }

    function renderScheduleCalendar() {
      var host = $("sched-cal");
      if (!host) return;
      host.textContent = "";
      if (!schedRanges.length) return;

      var hint = document.createElement("p");
      hint.className = "sched-hint";
      hint.textContent = "가로 타임라인 · 각 구간은 업무 시작일부터 다음 업무 전날까지입니다.";
      host.appendChild(hint);

      var totalDays = schedRanges.reduce(function (sum, range) { return sum + range.days; }, 0);
      var origin = schedRanges[0].start;
      var finish = schedRanges[schedRanges.length - 1].end;

      var scroll = document.createElement("div");
      scroll.className = "sched-hscroll";
      var timeline = document.createElement("div");
      timeline.className = "sched-timeline";
      timeline.style.minWidth = Math.max(720, totalDays * 4) + "px";

      var axis = document.createElement("div");
      axis.className = "sched-axis";
      var cursor = new Date(origin.getFullYear(), origin.getMonth(), 1);
      var endMonth = new Date(finish.getFullYear(), finish.getMonth(), 1);
      while (cursor <= endMonth) {
        var mark = document.createElement("span");
        mark.className = "sched-month-mark";
        var offset = Math.max(0, (cursor - origin) / DAY);
        var pct = (offset / totalDays) * 100;
        mark.style.left = Math.min(100, Math.max(0, pct)) + "%";
        mark.textContent = cursor.getFullYear() + "." + String(cursor.getMonth() + 1).padStart(2, "0");
        axis.appendChild(mark);
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      }
      timeline.appendChild(axis);

      var track = document.createElement("div");
      track.className = "sched-track";
      track.setAttribute("role", "list");
      schedRanges.forEach(function (range) {
        var bar = document.createElement("div");
        bar.className = "sched-bar tone-" + range.tone + (range.key ? " key" : "") + (range.past ? " past" : "");
        bar.style.flex = range.days + " 1 0";
        bar.setAttribute("role", "listitem");
        bar.textContent = range.name;
        bar.title = range.name + " · " + fmt(range.start) + " ~ " + fmt(range.end) + (range.off ? " · " + range.off : "");
        track.appendChild(bar);
      });
      timeline.appendChild(track);

      var ends = document.createElement("div");
      ends.className = "sched-ends";
      ends.innerHTML = "<span>" + fmt(origin) + "</span><span>" + fmt(finish) + "</span>";
      timeline.appendChild(ends);

      scroll.appendChild(timeline);
      host.appendChild(scroll);

      var list = document.createElement("ul");
      list.className = "sched-ranges";
      var toneColors = ["#27c4d5", "#2ea090", "#5498ff", "#7ddecb", "#fae100", "#9aa4b2"];
      schedRanges.forEach(function (range) {
        var li = document.createElement("li");
        var sw = document.createElement("span");
        sw.className = "swatch";
        sw.style.background = toneColors[range.tone];
        var when = document.createElement("span");
        when.className = "when";
        when.textContent = fmt(range.start) + " ~ " + fmt(range.end);
        var what = document.createElement("span");
        what.className = "what";
        what.textContent = range.name;
        if (range.off) {
          var small = document.createElement("small");
          small.textContent = range.off;
          what.appendChild(small);
        }
        li.appendChild(sw);
        li.appendChild(when);
        li.appendChild(what);
        list.appendChild(li);
      });
      host.appendChild(list);
    }

    function plan() {
      var value = $("p-target").value;
      var steps = $("p-steps");
      var verdict = $("p-verdict");
      var host = $("sched-cal");
      if (steps) steps.textContent = "";
      if (host) host.textContent = "";
      var target = parseIso(value);
      if (!value || !target) {
        verdict.className = "p-verdict";
        verdict.textContent = "목표 심사 시작일을 선택하세요.";
        lastPlan = null;
        schedRanges = [];
        return;
      }
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      schedRanges = buildRanges(target, today);
      schedRanges.forEach(function (range) {
        if (steps) {
          var li = document.createElement("li");
          li.textContent = fmt(range.start) + " ~ " + fmt(range.end) + " " + range.name;
          steps.appendChild(li);
        }
      });
      renderScheduleCalendar();
      var start = new Date(target.getTime() - 30 * 7 * DAY);
      lastPlan = { target: target, start: start, late: start < today };
      var daysLeft = Math.round((start - today) / DAY);
      if (target <= today) {
        verdict.className = "p-verdict late";
        verdict.textContent = "목표일이 이미 지났거나 오늘입니다. 다른 날짜를 선택하세요.";
      } else if (daysLeft >= 0) {
        verdict.className = "p-verdict ok";
        verdict.innerHTML = "늦어도 <b>" + fmt(start) + "</b>까지 착수하면 권장 일정으로 가능합니다. 착수까지 <b>D-" + daysLeft + "</b>.";
      } else {
        var shortWeeks = Math.ceil(-daysLeft / 7);
        verdict.className = "p-verdict late";
        verdict.innerHTML = "권장 일정보다 <b>약 " + shortWeeks + "주</b>가 부족합니다. 신청 전 관리체계 운영 2개월은 줄일 수 없으므로, 범위를 좁히거나 분석·대책 단계를 병행하는 단축 일정이 필요합니다." + (on("h-iso") || on("h-isms") ? " 보유 인증의 증적을 다시 쓰면 앞 단계를 줄일 수 있습니다." : "");
      }
    }

    navi.addEventListener("change", function () { diagnose(); plan(); });
    navi.addEventListener("submit", function (e) { e.preventDefault(); });
    $("p-target").addEventListener("change", plan);
    $("p-target").addEventListener("input", plan);
    diagnose();
    plan();

    var toContact = $("to-contact");
    if (toContact) {
      toContact.addEventListener("click", function () {
        var sel = $("q-sector");
        var lines = ["[셀프 진단 결과]", "업종: " + sel.options[sel.selectedIndex].text];
        var held = [["h-isms", "ISMS"], ["h-ismsp", "ISMS-P"], ["h-iso", "ISO 27001"]].filter(function (pair) {
          return on(pair[0]);
        }).map(function (pair) { return pair[1]; });
        lines.push("보유 인증: " + (held.length ? held.join(", ") : "없음"));
        lastOut.forEach(function (row) {
          lines.push("- [" + BADGE[row[0]][1] + "] " + row[1]);
        });
        if (lastPlan) {
          lines.push("목표 인증심사일: " + fmt(lastPlan.target) + " / 권장 착수일: " + fmt(lastPlan.start) + (lastPlan.late ? " (권장 일정보다 늦음)" : ""));
        }
        var text = lastOut.map(function (row) { return row[1]; }).join(" ");
        var areas = [];
        if (/ISMS/.test(text)) areas.push("c1");
        if (/ISO\/IEC 27001|ISO 27001/.test(text)) areas.push("c2");
        if (/개인정보|ISMS-P/.test(text)) areas.push("c3");
        if (/AI|42001/.test(text)) areas.push("c5");
        var payload = {
          message: lines.join("\n"),
          pii: on("q-pii"),
          areas: areas
        };
        try { sessionStorage.setItem("tbell-consult-v01", JSON.stringify(payload)); } catch (err) { /* storage unavailable */ }
        location.href = "contact.html?d=" + encodeURIComponent(JSON.stringify(payload));
      });
    }
  }

  var form = $("inquiry");
  if (form) {
    var data = null;
    try {
      var fromUrl = new URLSearchParams(location.search).get("d");
      if (fromUrl) data = JSON.parse(fromUrl);
    } catch (err) { data = null; }
    if (!data) {
      try {
        var raw = sessionStorage.getItem("tbell-consult-v01");
        if (raw) data = JSON.parse(raw);
      } catch (err) { data = null; }
    }
    if (data) {
      if (data.message && !$("f-msg").value) $("f-msg").value = data.message;
      if (data.pii && $("sv-pii") && !$("sv-pii").value) $("sv-pii").value = "100만 명 이상";
      (data.areas || []).forEach(function (id) {
        var box = $(id);
        if (box) box.checked = true;
      });
      var note = $("import-note");
      if (note && data.message) note.hidden = false;
    }

    var msg = $("form-msg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.classList.remove("err");
      var name = form.elements.name.value.trim();
      var company = form.elements.company.value.trim();
      var email = form.elements.email.value.trim();
      if (!name || !company) {
        msg.textContent = "이름과 회사명을 입력해 주세요.";
        msg.classList.add("err");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = "이메일 주소 형식을 확인해 주세요.";
        msg.classList.add("err");
        return;
      }
      if (!$("f-agree").checked) {
        msg.textContent = "개인정보 수집·이용에 동의해 주세요.";
        msg.classList.add("err");
        return;
      }
      msg.textContent = "입력이 확인되었습니다. 시안이라 실제로 전송되지는 않습니다.";
      try { sessionStorage.removeItem("tbell-consult-v01"); } catch (err) { /* ignore */ }
    });
  }
})();
