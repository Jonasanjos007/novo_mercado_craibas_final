using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Domain.Enums
{
    public enum RegistrationStatusEnum
    {
        Started,
        PersonalDataCompleted,
        EmailVerificationPending,
        EmailCompleted ,
        PasswordCompleted,
        Completed 
    }
}
