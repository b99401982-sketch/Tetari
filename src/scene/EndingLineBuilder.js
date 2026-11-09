import * as THREE from 'three';

/**
 * Creates the high-visibility, persistent 3D Ending Line / Finish Gantry
 * with checkered road ribbon, glowing laser finish beam, overhead digital arch,
 * animated checkered flags, and celebratory confetti particle system for the 1-minute time trial.
 */
export function buildEndingLine(splineData) {
  const endingLineGroup = new THREE.Group();
  endingLineGroup.name = 'EndingLineGroup';

  // Sample 646 is the calibrated Start/Finish location in Sector 6
  const finishPos = new THREE.Vector3(0.0183, 0.03502, 0.255);

  // -------------------------------------------------------------------------
  // 1. PROCEDURAL CHECKERED FINISH LINE TEXTURE
  // -------------------------------------------------------------------------
  function createRoadCheckeredTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Dark sleek carbon background
    ctx.fillStyle = '#080a10';
    ctx.fillRect(0, 0, 512, 128);

    // Glowing cyan/gold outer border strips
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(0, 0, 512, 6);
    ctx.fillRect(0, 122, 512, 6);

    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(0, 6, 512, 4);
    ctx.fillRect(0, 118, 512, 4);

    // 16 columns x 4 rows of high-contrast alternating squares
    const cols = 16;
    const rows = 4;
    const cellW = 512 / cols;
    const cellH = (128 - 20) / rows;
    const startY = 10;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isWhite = (r + c) % 2 === 0;
        ctx.fillStyle = isWhite ? '#f8fafc' : '#0d1117';
        ctx.fillRect(c * cellW, startY + r * cellH, cellW, cellH);

        if (isWhite) {
          // Slight pearl highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(c * cellW + 1, startY + r * cellH + 1, cellW - 2, 3);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  const checkeredRoadTex = createRoadCheckeredTexture();

  // -------------------------------------------------------------------------
  // 2. CHECKERED ROAD SURFACE RIBBON
  // -------------------------------------------------------------------------
  // Spans 0.024m laterally (Z axis) and 0.0072m longitudinally (X axis)
  const finishStripeGeo = new THREE.PlaneGeometry(0.0072, 0.024);
  const finishStripeMat = new THREE.MeshStandardMaterial({
    map: checkeredRoadTex,
    roughness: 0.32,
    metalness: 0.22,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });

  const finishStripeMesh = new THREE.Mesh(finishStripeGeo, finishStripeMat);
  finishStripeMesh.rotation.x = -Math.PI / 2;
  finishStripeMesh.rotation.z = -Math.PI / 2;
  finishStripeMesh.position.set(finishPos.x, finishPos.y + 0.00018, finishPos.z);
  finishStripeMesh.receiveShadow = true;
  endingLineGroup.add(finishStripeMesh);

  // FIA Curb accents (Left & Right curbs in fluorescent cyan & amber)
  const curbAccentGeo = new THREE.BoxGeometry(0.0076, 0.0008, 0.0028);
  const curbAccentMatCyan = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.65,
    roughness: 0.25,
  });
  const curbAccentMatGold = new THREE.MeshStandardMaterial({
    color: 0xffaa44,
    emissive: 0xffaa44,
    emissiveIntensity: 0.65,
    roughness: 0.25,
  });

  const leftCurbAccent = new THREE.Mesh(curbAccentGeo, curbAccentMatCyan);
  leftCurbAccent.position.set(finishPos.x, finishPos.y + 0.0005, finishPos.z - 0.0118);
  endingLineGroup.add(leftCurbAccent);

  const rightCurbAccent = new THREE.Mesh(curbAccentGeo, curbAccentMatGold);
  rightCurbAccent.position.set(finishPos.x, finishPos.y + 0.0005, finishPos.z + 0.0118);
  endingLineGroup.add(rightCurbAccent);

  // -------------------------------------------------------------------------
  // 3. LUMINESCENT LASER FINISH BEAM
  // -------------------------------------------------------------------------
  function createLaserBeamTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 128);

    // Vertical beam gradient: bright core at bottom, fading towards top
    const grad = ctx.createLinearGradient(0, 128, 0, 0);
    grad.addColorStop(0.0, 'rgba(0, 240, 255, 0.85)');
    grad.addColorStop(0.2, 'rgba(0, 220, 255, 0.55)');
    grad.addColorStop(0.65, 'rgba(255, 170, 68, 0.22)');
    grad.addColorStop(1.0, 'rgba(255, 170, 68, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);

    // Thin vertical scanning grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    for (let x = 16; x < 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 128);
      ctx.lineTo(x, 20);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const laserTex = createLaserBeamTexture();
  const laserGeo = new THREE.PlaneGeometry(0.023, 0.016);
  const laserMat = new THREE.MeshBasicMaterial({
    map: laserTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    opacity: 0.65,
  });

  const laserMesh = new THREE.Mesh(laserGeo, laserMat);
  laserMesh.position.set(finishPos.x, finishPos.y + 0.008, finishPos.z);
  laserMesh.rotation.y = Math.PI / 2; // Spans across Z axis
  endingLineGroup.add(laserMesh);

  // -------------------------------------------------------------------------
  // 4. OVERHEAD GRAND PRIX TRUSS GANTRY ARCH
  // -------------------------------------------------------------------------
  const gantryArchGroup = new THREE.Group();
  gantryArchGroup.name = 'EndingLineTrussArch';

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0x8e9bb0,
    roughness: 0.32,
    metalness: 0.82,
  });

  const darkHousingMat = new THREE.MeshStandardMaterial({
    color: 0x11141c,
    roughness: 0.35,
    metalness: 0.7,
  });

  // Vertical truss support towers on Z = -0.0185 and Z = +0.0185
  const towerHeight = 0.034;
  for (const gz of [-0.0185, 0.0185]) {
    // Base plate
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, 0.0016, 0.006),
      silverMat
    );
    basePlate.position.set(finishPos.x, finishPos.y + 0.0008, finishPos.z + gz);
    basePlate.castShadow = true;
    gantryArchGroup.add(basePlate);

    // Vertical column
    const column = new THREE.Mesh(
      new THREE.BoxGeometry(0.0036, towerHeight, 0.0036),
      silverMat
    );
    column.position.set(finishPos.x, finishPos.y + towerHeight * 0.5, finishPos.z + gz);
    column.castShadow = true;
    gantryArchGroup.add(column);

    // Cross brace struts
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0007, 0.0007, 0.012),
      silverMat
    );
    strut.position.set(finishPos.x, finishPos.y + towerHeight * 0.72, finishPos.z + gz * 0.82);
    strut.rotation.x = Math.PI / 4;
    gantryArchGroup.add(strut);

    // Strobe beacon dome atop tower
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.0012, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffaa44 })
    );
    beacon.position.set(finishPos.x, finishPos.y + towerHeight + 0.0012, finishPos.z + gz);
    gantryArchGroup.add(beacon);
  }

  // Overhead Signboard Box spanning across the track at Y = +0.027m above roadway
  const signElevation = finishPos.y + towerHeight * 0.82;
  const signHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.0055, 0.010, 0.042),
    darkHousingMat
  );
  signHousing.position.set(finishPos.x, signElevation, finishPos.z);
  signHousing.castShadow = true;
  gantryArchGroup.add(signHousing);

  // Digital Sign Face Textures
  function createSignFaceTexture(isFront = true) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#07090f';
    ctx.fillRect(0, 0, 512, 128);

    // Cyan glowing outer rim
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 506, 122);

    // Amber inner accent
    ctx.strokeStyle = '#ffaa44';
    ctx.lineWidth = 2;
    ctx.strokeRect(9, 9, 494, 110);

    // Checkered flag icons on left and right
    const drawMiniFlag = (ox, oy) => {
      const sq = 10;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#111622';
          ctx.fillRect(ox + c * sq, oy + r * sq, sq, sq);
        }
      }
      ctx.strokeStyle = '#ffaa44';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox, oy, 40, 40);
    };

    drawMiniFlag(20, 44);
    drawMiniFlag(452, 44);

    if (isFront) {
      // Top header
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 20px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦ 1-MIN TIME TRIAL ✦', 256, 38);

      // Main big bold text
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 italic 42px "Orbitron", sans-serif';
      ctx.shadowColor = 'rgba(0, 229, 255, 0.85)';
      ctx.shadowBlur = 14;
      ctx.fillText('ENDING LINE', 256, 82);
      ctx.shadowBlur = 0;

      // Bottom subtext
      ctx.fillStyle = '#ffaa44';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText('FINISH GATE · 01:00 TARGET', 256, 112);
    } else {
      ctx.fillStyle = '#ffaa44';
      ctx.font = 'bold 22px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DESK RACER GRAND PRIX', 256, 46);

      ctx.fillStyle = '#00e5ff';
      ctx.font = '900 italic 38px "Orbitron", sans-serif';
      ctx.fillText('SPEEDWAY CIRCUIT', 256, 92);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const signTexFront = createSignFaceTexture(true);
  const signTexBack = createSignFaceTexture(false);

  const signFaceMatFront = new THREE.MeshStandardMaterial({
    map: signTexFront,
    emissiveMap: signTexFront,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });

  const signFaceMatBack = new THREE.MeshStandardMaterial({
    map: signTexBack,
    emissiveMap: signTexBack,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.65,
    roughness: 0.25,
  });

  // Front face (facing oncoming karts approaching from +X)
  const signFaceFront = new THREE.Mesh(
    new THREE.PlaneGeometry(0.038, 0.009),
    signFaceMatFront
  );
  signFaceFront.position.set(finishPos.x + 0.00285, signElevation, finishPos.z);
  signFaceFront.rotation.y = Math.PI / 2;
  gantryArchGroup.add(signFaceFront);

  // Back face (facing -X)
  const signFaceBack = new THREE.Mesh(
    new THREE.PlaneGeometry(0.038, 0.009),
    signFaceMatBack
  );
  signFaceBack.position.set(finishPos.x - 0.00285, signElevation, finishPos.z);
  signFaceBack.rotation.y = -Math.PI / 2;
  gantryArchGroup.add(signFaceBack);

  // Under-gantry downlight LEDs illuminating the checkered road
  const underGantryLight = new THREE.PointLight(0x00e5ff, 0.45, 0.09, 2.0);
  underGantryLight.position.set(finishPos.x, signElevation - 0.006, finishPos.z);
  gantryArchGroup.add(underGantryLight);

  endingLineGroup.add(gantryArchGroup);

  // -------------------------------------------------------------------------
  // 5. CELEBRATORY CONFETTI & SPARK SYSTEM
  // -------------------------------------------------------------------------
  const CONFETTI_COUNT = 96;
  const confettiGeo = new THREE.PlaneGeometry(0.0016, 0.0012);
  const confettiMats = [
    new THREE.MeshBasicMaterial({ color: 0xffaa44, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0xff2d55, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x32d74b, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0xb55fe6, side: THREE.DoubleSide }),
  ];

  const confettiGroup = new THREE.Group();
  confettiGroup.name = 'FinishConfettiGroup';
  confettiGroup.visible = false;

  const confettiParticles = [];
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const mat = confettiMats[i % confettiMats.length];
    const mesh = new THREE.Mesh(confettiGeo, mat);
    confettiGroup.add(mesh);
    confettiParticles.push({
      mesh,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 16.0,
        (Math.random() - 0.5) * 16.0,
        (Math.random() - 0.5) * 16.0
      ),
      active: false,
    });
  }
  endingLineGroup.add(confettiGroup);

  let celebrationActive = false;
  let celebrationTimer = 0.0;

  function triggerCelebration() {
    celebrationActive = true;
    celebrationTimer = 0.0;
    confettiGroup.visible = true;

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const p = confettiParticles[i];
      p.active = true;
      p.pos.set(
        finishPos.x + (Math.random() - 0.5) * 0.008,
        signElevation - 0.002,
        finishPos.z + (Math.random() - 0.5) * 0.032
      );
      // Explode outward and upward
      p.vel.set(
        (Math.random() - 0.5) * 0.065,
        0.055 + Math.random() * 0.065,
        (Math.random() - 0.5) * 0.075
      );
      p.mesh.position.copy(p.pos);
      p.mesh.scale.setScalar(1.0);
    }
  }

  function resetCelebration() {
    celebrationActive = false;
    celebrationTimer = 0.0;
    confettiGroup.visible = false;
    for (const p of confettiParticles) {
      p.active = false;
    }
  }

  // -------------------------------------------------------------------------
  // 6. UPDATE TICK
  // -------------------------------------------------------------------------
  function update(dt, elapsedTime, timeRemaining = 60.0, isFinish = false) {
    // Pulse laser beam
    const isUrgent = timeRemaining <= 10.0 && !isFinish;
    const pulseSpeed = isUrgent ? 10.0 : 3.5;
    const pulseVal = Math.sin(elapsedTime * pulseSpeed);

    laserMat.opacity = isUrgent
      ? 0.45 + 0.40 * Math.abs(pulseVal)
      : 0.35 + 0.30 * Math.abs(pulseVal);

    if (isUrgent) {
      laserMat.color.setHex(pulseVal > 0 ? 0xffaa44 : 0x00e5ff);
      underGantryLight.color.setHex(0xffaa44);
      underGantryLight.intensity = 0.65 + 0.35 * Math.abs(pulseVal);
    } else if (isFinish) {
      laserMat.color.setHex(0x32d74b);
      underGantryLight.color.setHex(0x32d74b);
      underGantryLight.intensity = 0.85;
    } else {
      laserMat.color.setHex(0x00e5ff);
      underGantryLight.color.setHex(0x00e5ff);
      underGantryLight.intensity = 0.45;
    }

    // Update confetti celebration particles if active
    if (celebrationActive) {
      celebrationTimer += dt;
      let activeCount = 0;

      for (let i = 0; i < CONFETTI_COUNT; i++) {
        const p = confettiParticles[i];
        if (!p.active) continue;

        activeCount++;
        // Apply gravity and drag
        p.vel.y -= 0.14 * dt;
        p.vel.x *= Math.max(0.0, 1.0 - 1.2 * dt);
        p.vel.z *= Math.max(0.0, 1.0 - 1.2 * dt);

        p.pos.addScaledVector(p.vel, dt);
        p.mesh.position.copy(p.pos);

        p.mesh.rotation.x += p.rotSpeed.x * dt;
        p.mesh.rotation.y += p.rotSpeed.y * dt;
        p.mesh.rotation.z += p.rotSpeed.z * dt;

        // Ground collision at desk table level (Y ~ 0.0)
        if (p.pos.y < 0.001) {
          p.pos.y = 0.001;
          p.vel.set(0, 0, 0);
          p.mesh.position.y = 0.001;
        }

        // Fade scale out after 4 seconds
        if (celebrationTimer > 3.0) {
          const fade = Math.max(0.0, 1.0 - (celebrationTimer - 3.0) / 2.0);
          p.mesh.scale.setScalar(fade);
          if (fade <= 0.01) p.active = false;
        }
      }

      if (celebrationTimer > 5.5 || activeCount === 0) {
        celebrationActive = false;
        confettiGroup.visible = false;
      }
    }
  }

  return {
    group: endingLineGroup,
    finishPos,
    update,
    triggerCelebration,
    resetCelebration,
  };
}
