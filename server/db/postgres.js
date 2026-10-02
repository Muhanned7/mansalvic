const { Pool } = require('pg');

// Initial seed HR Managers for Offshore Technical Recruitment
const SEED_HR_MANAGERS = [
  {
    id: 'hr_nair_01',
    full_name: 'Priya Nair',
    email: 'p.nair@mansalvic.com',
    phone: '+1 (614) 555-0182',
    title: 'Lead Offshore Talent Acquisition Partner',
    offshore_region: 'India & South Asia',
    status: 'ACTIVE',
    active_client_count: 2
  },
  {
    id: 'hr_mendoza_02',
    full_name: 'Carlos Mendoza',
    email: 'c.mendoza@mansalvic.com',
    phone: '+1 (614) 555-0194',
    title: 'Nearshore & LatAm Engineering Recruiter',
    offshore_region: 'Latin America (US-Aligned)',
    status: 'ACTIVE',
    active_client_count: 1
  },
  {
    id: 'hr_khan_03',
    full_name: 'Aisha Khan',
    email: 'a.khan@mansalvic.com',
    phone: '+1 (614) 555-0177',
    title: 'Principal Technical Recruitment Strategist',
    offshore_region: 'Global Enterprise Delivery',
    status: 'ACTIVE',
    active_client_count: 0
  }
];

// Initial seed Offshore Technical Workers / Engineers
const SEED_WORKERS = [
  {
    id: 'wrk_leo_01',
    full_name: 'Leo Vance',
    email: 'leo.vance@offshore.mansalvic.com',
    role: 'Senior Full-Stack Architect',
    skills: 'React, Node.js, TypeScript, Next.js, PostgreSQL, Microservices',
    timezone: 'Offshore US-Aligned (EST Overlap 9am-6pm)',
    hourly_rate: 55.00,
    availability: 'AVAILABLE'
  },
  {
    id: 'wrk_maya_02',
    full_name: 'Maya Lin',
    email: 'maya.lin@offshore.mansalvic.com',
    role: 'Cloud DevOps & SRE Specialist',
    skills: 'AWS, Azure, Kubernetes, Terraform, Docker, CI/CD, Zero-Downtime SLAs',
    timezone: 'Offshore US-Aligned (CST Overlap)',
    hourly_rate: 65.00,
    availability: 'AVAILABLE'
  },
  {
    id: 'wrk_pip_03',
    full_name: 'Pip Patel',
    email: 'pip.patel@offshore.mansalvic.com',
    role: '24/7 Platform Reliability Engineer',
    skills: 'Database Optimization, Security Patching, Python, Redis, Linux SysAdmin',
    timezone: 'Offshore US-Aligned (24/7 Night/Day Shift)',
    hourly_rate: 50.00,
    availability: 'AVAILABLE'
  },
  {
    id: 'wrk_elena_04',
    full_name: 'Elena Rostova',
    email: 'elena.r@offshore.mansalvic.com',
    role: 'Mobile Apps & Cross-Platform Lead',
    skills: 'React Native, Flutter, Swift, Kotlin, GraphQL, Real-Time WebSockets',
    timezone: 'Offshore US-Aligned (EST Overlap)',
    hourly_rate: 60.00,
    availability: 'AVAILABLE'
  }
];

class PostgresDatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;

    // Fallback in-memory store
    this.memoryStore = {
      hrs: [...SEED_HR_MANAGERS],
      clients: [],
      workers: [...SEED_WORKERS],
      allocations: []
    };

    this.init();
  }

  async init() {
    const connectionString = process.env.DATABASE_URL || 
      (process.env.PG_HOST ? `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT || 5432}/${process.env.PG_DATABASE}` : null);

    if (connectionString) {
      try {
        this.pool = new Pool({
          connectionString,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          connectionTimeoutMillis: 5000
        });

        const client = await this.pool.connect();
        this.isConnected = true;
        client.release();
        console.log('✅ PostgreSQL connected successfully to:', connectionString.replace(/:[^:@]+@/, ':****@'));

        await this.runMigrations();
      } catch (err) {
        console.warn('⚠️ PostgreSQL connection failed, switching to persistent in-memory fallback:', err.message);
        this.isConnected = false;
      }
    } else {
      console.log('ℹ️ No DATABASE_URL provided. Operating with PostgreSQL simulated in-memory store.');
    }
  }

  async runMigrations() {
    if (!this.isConnected || !this.pool) return;

    const migrationQuery = `
      CREATE TABLE IF NOT EXISTS hr_managers (
        id VARCHAR(50) PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        title VARCHAR(100),
        offshore_region VARCHAR(100),
        status VARCHAR(20) DEFAULT 'ACTIVE',
        active_client_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(50) PRIMARY KEY,
        assigned_hr_id VARCHAR(50) REFERENCES hr_managers(id) ON DELETE SET NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(100),
        service_type VARCHAR(50),
        status VARCHAR(30) DEFAULT 'NEW',
        visitor_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workers (
        id VARCHAR(50) PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        skills TEXT NOT NULL,
        timezone VARCHAR(100) DEFAULT 'Offshore US-Aligned (EST)',
        hourly_rate DECIMAL(10, 2),
        availability VARCHAR(30) DEFAULT 'AVAILABLE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS allocations (
        id VARCHAR(50) PRIMARY KEY,
        client_id VARCHAR(50) REFERENCES clients(id) ON DELETE CASCADE,
        hr_id VARCHAR(50) REFERENCES hr_managers(id) ON DELETE SET NULL,
        worker_id VARCHAR(50) REFERENCES workers(id) ON DELETE CASCADE,
        recruitment_stage VARCHAR(50) DEFAULT 'ALLOTTED',
        agreed_rate DECIMAL(10, 2),
        allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'ACTIVE'
      );
    `;

    try {
      await this.pool.query(migrationQuery);
      console.log('✅ PostgreSQL tables verified/created: hr_managers, clients, workers, allocations');

      const hrCount = await this.pool.query('SELECT COUNT(*) FROM hr_managers');
      if (parseInt(hrCount.rows[0].count) === 0) {
        for (const hr of SEED_HR_MANAGERS) {
          await this.pool.query(
            'INSERT INTO hr_managers (id, full_name, email, phone, title, offshore_region, status, active_client_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [hr.id, hr.full_name, hr.email, hr.phone, hr.title, hr.offshore_region, hr.status, hr.active_client_count]
          );
        }
        console.log('✅ Seeded initial HR Managers in PostgreSQL.');
      }

      const workerCount = await this.pool.query('SELECT COUNT(*) FROM workers');
      if (parseInt(workerCount.rows[0].count) === 0) {
        for (const w of SEED_WORKERS) {
          await this.pool.query(
            'INSERT INTO workers (id, full_name, email, role, skills, timezone, hourly_rate, availability) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [w.id, w.full_name, w.email, w.role, w.skills, w.timezone, w.hourly_rate, w.availability]
          );
        }
        console.log('✅ Seeded initial Workers in PostgreSQL.');
      }
    } catch (err) {
      console.error('PostgreSQL migration error:', err);
    }
  }

  async getBestAvailableHr() {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        "SELECT * FROM hr_managers WHERE status = 'ACTIVE' ORDER BY active_client_count ASC LIMIT 1"
      );
      if (res.rows.length > 0) return res.rows[0];
    }
    
    const sortedHrs = [...this.memoryStore.hrs].sort((a, b) => a.active_client_count - b.active_client_count);
    return sortedHrs[0] || SEED_HR_MANAGERS[0];
  }

  async createClient(data) {
    const id = data.id || 'cli_' + Math.random().toString(36).substring(2, 9);
    const assignedHr = data.assigned_hr_id ? { id: data.assigned_hr_id } : await this.getBestAvailableHr();
    const assignedHrId = assignedHr ? assignedHr.id : null;

    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO clients (id, assigned_hr_id, full_name, email, phone, company, service_type, status, visitor_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        id,
        assignedHrId,
        data.full_name,
        data.email,
        data.phone || '',
        data.company || '',
        data.service_type || 'staffing',
        'HR_ASSIGNED',
        data.visitor_id || ''
      ]);

      if (assignedHrId) {
        await this.pool.query('UPDATE hr_managers SET active_client_count = active_client_count + 1 WHERE id = $1', [assignedHrId]);
      }

      return res.rows[0];
    }

    const newClient = {
      id,
      assigned_hr_id: assignedHrId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || '',
      company: data.company || '',
      service_type: data.service_type || 'staffing',
      status: 'HR_ASSIGNED',
      visitor_id: data.visitor_id || '',
      created_at: new Date().toISOString()
    };

    this.memoryStore.clients.unshift(newClient);

    const hrObj = this.memoryStore.hrs.find(h => h.id === assignedHrId);
    if (hrObj) hrObj.active_client_count += 1;

    return newClient;
  }

  async getClients() {
    if (this.isConnected && this.pool) {
      const query = `
        SELECT c.*, 
               h.full_name as hr_name, h.email as hr_email, h.offshore_region as hr_region,
               w.id as worker_id, w.full_name as worker_name, w.role as worker_role, w.hourly_rate as worker_rate,
               a.recruitment_stage, a.status as allocation_status
        FROM clients c
        LEFT JOIN hr_managers h ON c.assigned_hr_id = h.id
        LEFT JOIN allocations a ON c.id = a.client_id AND a.status = 'ACTIVE'
        LEFT JOIN workers w ON a.worker_id = w.id
        ORDER BY c.created_at DESC;
      `;
      const res = await this.pool.query(query);
      return res.rows;
    }

    return this.memoryStore.clients.map(c => {
      const hr = this.memoryStore.hrs.find(h => h.id === c.assigned_hr_id);
      const activeAllocs = this.memoryStore.allocations.filter(a => a.client_id === c.id && a.status === 'ACTIVE');
      const allocatedWorkers = activeAllocs.map(a => {
        const w = this.memoryStore.workers.find(worker => worker.id === a.worker_id);
        return {
          allocation_id: a.id,
          worker_id: a.worker_id,
          name: w ? w.full_name : a.worker_id,
          role: w ? w.role : 'Specialist',
          email: w ? w.email : '',
          rate: a.agreed_rate || (w ? w.hourly_rate : 55),
          stage: a.recruitment_stage,
          allocated_at: a.allocated_at
        };
      });
      const firstWorker = allocatedWorkers[0] || null;

      return {
        ...c,
        hr_name: hr ? hr.full_name : null,
        hr_email: hr ? hr.email : null,
        hr_region: hr ? hr.offshore_region : null,
        worker_id: firstWorker ? firstWorker.worker_id : null,
        worker_name: firstWorker ? firstWorker.name : null,
        worker_role: firstWorker ? firstWorker.role : null,
        worker_rate: firstWorker ? firstWorker.rate : null,
        recruitment_stage: firstWorker ? firstWorker.stage : null,
        allocation_status: firstWorker ? 'ACTIVE' : null,
        allocated_workers: allocatedWorkers
      };
    });
  }

  async getHrManagers() {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM hr_managers ORDER BY full_name ASC');
      return res.rows;
    }
    return this.memoryStore.hrs;
  }

  async getWorkers(roleFilter = '') {
    if (this.isConnected && this.pool) {
      const query = roleFilter 
        ? 'SELECT * FROM workers WHERE role ILIKE $1 ORDER BY full_name ASC'
        : 'SELECT * FROM workers ORDER BY full_name ASC';
      const params = roleFilter ? [`%${roleFilter}%`] : [];
      const res = await this.pool.query(query, params);
      return res.rows;
    }
    return this.memoryStore.workers;
  }

  async assignHrToClient(clientId, hrId) {
    if (this.isConnected && this.pool) {
      await this.pool.query('UPDATE clients SET assigned_hr_id = $1, status = $2 WHERE id = $3', [hrId, 'HR_ASSIGNED', clientId]);
      return true;
    }

    const client = this.memoryStore.clients.find(c => c.id === clientId);
    if (client) {
      client.assigned_hr_id = hrId;
      client.status = 'HR_ASSIGNED';
      return true;
    }
    return false;
  }

  async createWorker(data) {
    const id = data.id || 'wrk_' + Math.random().toString(36).substring(2, 9);
    const newWorker = {
      id,
      full_name: data.full_name,
      email: data.email,
      role: data.role || 'Senior Software Engineer',
      skills: data.skills || 'JavaScript, TypeScript, React, Node.js',
      timezone: data.timezone || 'Offshore US-Aligned (4–6h Daily US Overlap)',
      hourly_rate: parseFloat(data.hourly_rate) || 55.00,
      availability: data.availability || 'AVAILABLE',
      created_at: new Date().toISOString()
    };

    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO workers (id, full_name, email, role, skills, timezone, hourly_rate, availability)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        newWorker.id,
        newWorker.full_name,
        newWorker.email,
        newWorker.role,
        newWorker.skills,
        newWorker.timezone,
        newWorker.hourly_rate,
        newWorker.availability
      ]);
      return res.rows[0];
    }

    this.memoryStore.workers.unshift(newWorker);
    return newWorker;
  }

  async allotWorkerToClient(clientId, hrId, workerId, stage = 'ALLOTTED', agreedRate = null) {
    const id = 'alloc_' + Math.random().toString(36).substring(2, 9);

    if (this.isConnected && this.pool) {
      // Check if this specific worker is already allotted to this client
      const existing = await this.pool.query(
        "SELECT * FROM allocations WHERE client_id = $1 AND worker_id = $2 AND status = 'ACTIVE'",
        [clientId, workerId]
      );

      if (existing.rows.length > 0) {
        const updateQuery = `
          UPDATE allocations
          SET recruitment_stage = $1, agreed_rate = $2
          WHERE id = $3
          RETURNING *;
        `;
        const res = await this.pool.query(updateQuery, [stage, agreedRate, existing.rows[0].id]);
        return res.rows[0];
      }

      const query = `
        INSERT INTO allocations (id, client_id, hr_id, worker_id, recruitment_stage, agreed_rate, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
        RETURNING *;
      `;
      const res = await this.pool.query(query, [id, clientId, hrId, workerId, stage, agreedRate]);

      await this.pool.query("UPDATE clients SET status = 'ALLOCATED' WHERE id = $1", [clientId]);
      await this.pool.query("UPDATE workers SET availability = 'ALLOTTED' WHERE id = $1", [workerId]);

      return res.rows[0];
    }

    // In-Memory Fallback: update if already active for this client, or append as new squad member
    let existingAlloc = this.memoryStore.allocations.find(
      a => a.client_id === clientId && a.worker_id === workerId && a.status === 'ACTIVE'
    );

    if (existingAlloc) {
      existingAlloc.recruitment_stage = stage;
      if (agreedRate !== undefined && agreedRate !== null) existingAlloc.agreed_rate = agreedRate;
      return existingAlloc;
    }

    const newAlloc = {
      id,
      client_id: clientId,
      hr_id: hrId,
      worker_id: workerId,
      recruitment_stage: stage,
      agreed_rate: agreedRate,
      allocated_at: new Date().toISOString(),
      status: 'ACTIVE'
    };

    this.memoryStore.allocations.unshift(newAlloc);

    const client = this.memoryStore.clients.find(c => c.id === clientId);
    if (client) client.status = 'ALLOCATED';

    const worker = this.memoryStore.workers.find(w => w.id === workerId);
    if (worker) worker.availability = 'ALLOTTED';

    return newAlloc;
  }
}

module.exports = new PostgresDatabaseManager();
