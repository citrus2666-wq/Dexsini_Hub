import sys
import os
sys.path.append(os.getcwd())
from app.core.database import engine
from sqlalchemy import text

def fix_constraints():
    sql_commands = [
        # 1. Fix leave_requests approver_id
        "ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS fk_leave_approver",
        "ALTER TABLE leave_requests ADD CONSTRAINT fk_leave_approver FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL",
        
        # 2. Fix overtime_requests approver_id
        "ALTER TABLE overtime_requests DROP CONSTRAINT IF EXISTS fk_ot_approver",
        "ALTER TABLE overtime_requests ADD CONSTRAINT fk_ot_approver FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL",
        
        # 3. Ensure manager_id in users is SET NULL
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_manager",
        "ALTER TABLE users ADD CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL",
        
        # 4. Ensure user_id in leave_requests is CASCADE
        "ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS fk_leave_user",
        "ALTER TABLE leave_requests ADD CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
        
        # 5. Ensure user_id in overtime_requests is CASCADE
        "ALTER TABLE overtime_requests DROP CONSTRAINT IF EXISTS fk_ot_user",
        "ALTER TABLE overtime_requests ADD CONSTRAINT fk_ot_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE",
        
        # 6. Ensure leave_type_id in leave_requests is CASCADE (optional, but good for consistency)
        "ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS fk_leave_type",
        "ALTER TABLE leave_requests ADD CONSTRAINT fk_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE"
    ]
    
    try:
        with engine.connect() as conn:
            for cmd in sql_commands:
                print(f"Executing: {cmd}")
                conn.execute(text(cmd))
            conn.commit()
            print("\nDatabase constraints updated successfully!")
    except Exception as e:
        print(f"\nError updating constraints: {e}")

if __name__ == "__main__":
    fix_constraints()
