import { createContext, useContext, useState, useEffect } from 'react'

const RoleContext = createContext(null)

export const ROLES = {
  EXECUTIVE: 'executive',
  PROJECT_MANAGER: 'project_manager',
  DEPARTMENT_HEAD: 'department_head',
  BU_HEAD: 'bu_head'
}

export const ROLE_LABELS = {
  [ROLES.EXECUTIVE]: 'Executive',
  [ROLES.PROJECT_MANAGER]: 'Project Manager',
  [ROLES.DEPARTMENT_HEAD]: 'Department Head',
  [ROLES.BU_HEAD]: 'Business Unit Head'
}

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('userRole')
    return saved || ROLES.EXECUTIVE
  })

  const [selectedDepartmentId, setSelectedDepartmentId] = useState(() => {
    const saved = localStorage.getItem('selectedDepartmentId')
    return saved ? parseInt(saved) : null
  })

  const [selectedBusinessUnitId, setSelectedBusinessUnitId] = useState(() => {
    const saved = localStorage.getItem('selectedBusinessUnitId')
    return saved ? parseInt(saved) : null
  })

  useEffect(() => {
    localStorage.setItem('userRole', role)
  }, [role])

  useEffect(() => {
    if (selectedDepartmentId) {
      localStorage.setItem('selectedDepartmentId', selectedDepartmentId.toString())
    } else {
      localStorage.removeItem('selectedDepartmentId')
    }
  }, [selectedDepartmentId])

  useEffect(() => {
    if (selectedBusinessUnitId) {
      localStorage.setItem('selectedBusinessUnitId', selectedBusinessUnitId.toString())
    } else {
      localStorage.removeItem('selectedBusinessUnitId')
    }
  }, [selectedBusinessUnitId])

  const hasFullAccess = role === ROLES.EXECUTIVE || role === ROLES.PROJECT_MANAGER

  const value = {
    role,
    setRole,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedBusinessUnitId,
    setSelectedBusinessUnitId,
    hasFullAccess,
    isDepartmentHead: role === ROLES.DEPARTMENT_HEAD,
    isBUHead: role === ROLES.BU_HEAD
  }

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}
