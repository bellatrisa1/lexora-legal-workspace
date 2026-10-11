CREATE TABLE organizations (
 id text PRIMARY KEY, name text NOT NULL, initials text NOT NULL,
 "timeZone" text NOT NULL, currency text NOT NULL
);
CREATE TABLE jurisdictions (id text PRIMARY KEY, name text NOT NULL);
CREATE TABLE practices (id text PRIMARY KEY, name text NOT NULL);
CREATE TABLE clients (
 id text PRIMARY KEY, "organizationId" text NOT NULL REFERENCES organizations(id),
 kind text NOT NULL CHECK (kind IN ('organization','individual')), name text NOT NULL,
 initials text NOT NULL, industry text NOT NULL, country text NOT NULL,
 contact text NOT NULL, email text NOT NULL, since text NOT NULL,
 UNIQUE ("organizationId",id)
);
CREATE TABLE users (
 id text PRIMARY KEY, "organizationId" text NOT NULL REFERENCES organizations(id),
 name text NOT NULL, initials text NOT NULL, role text NOT NULL CHECK(role IN ('client','lawyer','admin','paralegal','manager')),
 title text NOT NULL, email text NOT NULL, "timeZone" text NOT NULL, "clientId" text,
 UNIQUE ("organizationId",id),
 FOREIGN KEY ("organizationId","clientId") REFERENCES clients("organizationId",id)
);
CREATE SEQUENCE matter_reference_seq START 2000;
CREATE TABLE matters (
 id text PRIMARY KEY, reference text NOT NULL UNIQUE,
 "organizationId" text NOT NULL REFERENCES organizations(id),
 title text NOT NULL CHECK(length(title) BETWEEN 5 AND 120),
 "clientId" text NOT NULL, "practiceAreaId" text NOT NULL REFERENCES practices(id),
 "jurisdictionId" text NOT NULL REFERENCES jurisdictions(id), "leadCounselId" text,
 priority text NOT NULL CHECK(priority IN ('low','medium','high')),
 description text NOT NULL CHECK(length(description) BETWEEN 20 AND 4000),
 "targetDate" date NOT NULL,
 status text NOT NULL CHECK(status IN ('open','in_progress','in_review','client_action','on_hold','closed')),
 "teamIds" text[] NOT NULL DEFAULT '{}',
 "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
 UNIQUE ("organizationId",id),
 FOREIGN KEY ("organizationId","clientId") REFERENCES clients("organizationId",id),
 FOREIGN KEY ("organizationId","leadCounselId") REFERENCES users("organizationId",id)
);
CREATE TABLE documents (
 id text PRIMARY KEY, "organizationId" text NOT NULL, "matterId" text NOT NULL,
 name text NOT NULL, type text NOT NULL, "uploadedBy" text NOT NULL,
 "uploadedAt" timestamptz NOT NULL, version integer NOT NULL CHECK(version>0),
 status text NOT NULL CHECK(status IN ('draft','under_review','approved','executed','archived')),
 storage jsonb NOT NULL CHECK(storage->>'kind'='demo'),
 FOREIGN KEY ("organizationId","matterId") REFERENCES matters("organizationId",id),
 FOREIGN KEY ("organizationId","uploadedBy") REFERENCES users("organizationId",id)
);
CREATE TABLE tasks (
 id text PRIMARY KEY, "organizationId" text NOT NULL, "matterId" text NOT NULL,
 title text NOT NULL, "assigneeId" text NOT NULL, priority text NOT NULL CHECK(priority IN ('low','medium','high')),
 "dueDate" date NOT NULL, status text NOT NULL CHECK(status IN ('todo','in_progress','blocked','completed')),
 FOREIGN KEY ("organizationId","matterId") REFERENCES matters("organizationId",id),
 FOREIGN KEY ("organizationId","assigneeId") REFERENCES users("organizationId",id)
);
CREATE TABLE messages (
 id text PRIMARY KEY, "organizationId" text NOT NULL, "matterId" text NOT NULL, "authorId" text NOT NULL,
 text text NOT NULL CHECK(length(btrim(text)) BETWEEN 1 AND 2000), "createdAt" timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY ("organizationId","matterId") REFERENCES matters("organizationId",id),
 FOREIGN KEY ("organizationId","authorId") REFERENCES users("organizationId",id)
);
CREATE TABLE activities (
 id text PRIMARY KEY, "organizationId" text NOT NULL, "matterId" text NOT NULL, "actorId" text NOT NULL,
 "createdAt" timestamptz NOT NULL DEFAULT now(),
 type text NOT NULL CHECK(type IN ('matter_created','status_changed','counsel_assigned','document_added','message_sent','task_updated')),
 payload jsonb NOT NULL DEFAULT '{}',
 FOREIGN KEY ("organizationId","matterId") REFERENCES matters("organizationId",id),
 FOREIGN KEY ("organizationId","actorId") REFERENCES users("organizationId",id)
);
CREATE INDEX matters_org_updated ON matters("organizationId","updatedAt" DESC);
CREATE INDEX matters_client ON matters("organizationId","clientId");
CREATE INDEX tasks_matter ON tasks("organizationId","matterId");
CREATE INDEX documents_matter ON documents("organizationId","matterId");
CREATE INDEX messages_matter_time ON messages("organizationId","matterId","createdAt");
CREATE INDEX activities_matter_time ON activities("organizationId","matterId","createdAt" DESC);
